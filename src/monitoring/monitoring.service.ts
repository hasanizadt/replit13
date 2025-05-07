import { Injectable } from '@nestjs/common';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { LogQueryInput } from './dto/log-query.input';
import * as os from 'os';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MonitoringService {
  private metricsCollectionInterval: NodeJS.Timeout;
  private readonly metrics: any[] = [];
  
  // In-memory storage for recent metrics
  private readonly MAX_METRICS_HISTORY = 1000;
  
  // Request metrics tracking
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private responseTimes: number[] = [];
  private readonly RESPONSE_TIME_WINDOW = 10000; // Keep last 10,000 response times

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext('MonitoringService');
    
    // Start collecting metrics if enabled
    const monitoringEnabled = this.configService.get('app.monitoring.enabled', true);
    const interval = this.configService.get('app.monitoring.interval', 60) * 1000; // Convert to ms
    
    if (monitoringEnabled) {
      this.startMetricsCollection(interval);
    }
  }

  /**
   * Start collecting system metrics at the specified interval
   */
  private startMetricsCollection(intervalMs: number) {
    this.logger.log(`Starting metrics collection with interval of ${intervalMs}ms`);
    
    this.metricsCollectionInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.storeMetrics(metrics);
      } catch (error) {
        this.logger.error(`Error collecting metrics: ${error.message}`, error.stack);
      }
    }, intervalMs);
  }

  /**
   * Stop metrics collection
   */
  stopMetricsCollection() {
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.logger.log('Stopped metrics collection');
    }
  }

  /**
   * Collect system metrics
   */
  async collectMetrics() {
    try {
      // System resources
      const cpuUsage = os.loadavg()[0] / os.cpus().length; // Normalize by CPU count
      const memoryTotal = os.totalmem();
      const memoryFree = os.freemem();
      const memoryUsage = (memoryTotal - memoryFree) / memoryTotal;
      
      // Disk usage (root path)
      let diskUsage = 0;
      let diskTotal = 0;
      let diskFree = 0;
      
      try {
        // Get disk space on Linux/Mac
        if (process.platform !== 'win32') {
          const rootPath = '/';
          const stats = fs.statfsSync(rootPath);
          diskTotal = stats.blocks * stats.bsize;
          diskFree = stats.bfree * stats.bsize;
          diskUsage = (diskTotal - diskFree) / diskTotal;
        } else {
          // On Windows, this would require external modules
          // For simplicity, we'll use placeholder values
          diskTotal = 0;
          diskFree = 0;
          diskUsage = 0;
        }
      } catch (error) {
        this.logger.warn(`Failed to get disk usage: ${error.message}`);
      }
      
      // System uptime
      const uptimeSeconds = os.uptime();
      
      // Request metrics
      const p95ResponseTime = this.calculatePercentile(this.responseTimes, 95);
      const p99ResponseTime = this.calculatePercentile(this.responseTimes, 99);
      const averageResponseTime = this.responseTimes.length 
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
        : 0;
      
      // Database metrics (simplified)
      let dbMetrics = null;
      try {
        const dbClientCount = await this.getDatabaseConnectionCount();
        dbMetrics = {
          activeConnections: dbClientCount,
          maxConnections: 100, // This would ideally come from the database
          connectionUsagePercent: dbClientCount / 100,
          averageQueryTime: 0, // Would require query tracking
          queriesPerMinute: 0, // Would require query tracking
          slowQueries: 0, // Would require query tracking
        };
      } catch (error) {
        this.logger.warn(`Failed to get database metrics: ${error.message}`);
      }
      
      return {
        system: {
          cpuUsage,
          memoryUsage,
          memoryTotal,
          memoryFree,
          diskUsage,
          diskTotal,
          diskFree,
          uptimeSeconds,
        },
        requests: {
          totalRequests: this.totalRequests,
          successfulRequests: this.successfulRequests,
          failedRequests: this.failedRequests,
          averageResponseTime,
          p95ResponseTime,
          p99ResponseTime,
          activeConnections: 0, // Would require WebSocket tracking
          requestsPerMinute: this.calculateRequestsPerMinute(),
        },
        database: dbMetrics,
        cache: {
          totalItems: 0, // Would require cache integration
          hitRate: 0,
          missRate: 0,
          evictions: 0,
          averageGetTime: 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error collecting metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Store metrics in memory
   */
  private storeMetrics(metrics: any) {
    this.metrics.push(metrics);
    
    // Limit the size of metrics history
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics.shift(); // Remove oldest entry
    }
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number = 60) {
    return this.metrics.slice(-count);
  }

  /**
   * Get the latest metrics snapshot
   */
  getLatestMetrics() {
    return this.metrics.length ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Track a request and its response time
   */
  trackRequest(statusCode: number, responseTime: number) {
    this.totalRequests++;
    
    if (statusCode >= 200 && statusCode < 400) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }
    
    // Keep track of response times
    this.responseTimes.push(responseTime);
    
    // Limit the size of response times array
    if (this.responseTimes.length > this.RESPONSE_TIME_WINDOW) {
      this.responseTimes.shift();
    }
  }

  /**
   * Get system health information
   */
  async getSystemHealth() {
    try {
      const latestMetrics = await this.collectMetrics();
      
      // Determine status based on metrics
      const memoryAlertThreshold = this.configService.get('app.monitoring.memoryAlertThreshold', 0.9);
      const cpuAlertThreshold = this.configService.get('app.monitoring.cpuAlertThreshold', 0.8);
      const diskAlertThreshold = this.configService.get('app.monitoring.diskAlertThreshold', 0.9);
      
      const memoryStatus = latestMetrics.system.memoryUsage < memoryAlertThreshold ? 'ok' : 'warning';
      const cpuStatus = latestMetrics.system.cpuUsage < cpuAlertThreshold ? 'ok' : 'warning';
      const diskStatus = latestMetrics.system.diskUsage < diskAlertThreshold ? 'ok' : 'warning';
      const databaseStatus = latestMetrics.database?.connectionUsagePercent < 0.8 ? 'ok' : 'warning';
      
      const overallStatus = [memoryStatus, cpuStatus, diskStatus, databaseStatus].includes('warning')
        ? 'warning'
        : 'ok';
      
      return {
        status: overallStatus,
        uptime: latestMetrics.system.uptimeSeconds,
        timestamp: latestMetrics.timestamp,
        details: {
          memory: {
            status: memoryStatus,
            usage: latestMetrics.system.memoryUsage,
            total: latestMetrics.system.memoryTotal,
            free: latestMetrics.system.memoryFree,
          },
          cpu: {
            status: cpuStatus,
            usage: latestMetrics.system.cpuUsage,
          },
          disk: {
            status: diskStatus,
            usage: latestMetrics.system.diskUsage,
            total: latestMetrics.system.diskTotal,
            free: latestMetrics.system.diskFree,
          },
          database: {
            status: databaseStatus,
            connections: latestMetrics.database?.activeConnections || 0,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Error getting system health: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get logs with filtering and pagination
   */
  async getLogs(query: LogQueryInput) {
    try {
      // In a real application, this would query logs from a database or log aggregation system
      // For simplicity, we'll return some sample logs
      this.logger.debug(`Getting logs with query: ${JSON.stringify(query)}`);
      
      // Use the winston log files if they exist
      const logDir = this.configService.get('app.logging.fileDir', 'logs');
      let logs = [];
      
      // In this implementation, we're simulating log retrieval
      // In a real app, you would implement log storage and retrieval
      
      // Simulate pagination
      const { page, limit } = query;
      const startIdx = (page - 1) * limit;
      const endIdx = startIdx + limit;
      
      // Return paginated results
      return {
        logs: logs.slice(startIdx, endIdx),
        total: logs.length,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Error getting logs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get database connection count
   */
  private async getDatabaseConnectionCount(): Promise<number> {
    try {
      // This is a simplified approach and may not work in all setups
      // In a real application, you would query the database for active connections
      return 1; // Default to 1 (our connection)
    } catch (error) {
      this.logger.warn(`Failed to get database connection count: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate percentile value from an array
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Calculate requests per minute based on recent activity
   */
  private calculateRequestsPerMinute(): number {
    // Simplified calculation - in a real application, you'd track requests with timestamps
    return this.totalRequests / (process.uptime() / 60);
  }
}
