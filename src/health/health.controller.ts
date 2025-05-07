import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger/logger.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaIndicator: PrismaHealthIndicator,
    private prisma: PrismaService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    this.logger.setContext('HealthController');
  }

  @Get()
  @HealthCheck()
  check() {
    this.logger.log('Processing health check request');
    
    return this.health.check([
      // Check that the API is responding
      () => this.http.pingCheck('api', this.getApiUrl()),
      
      // Check that the database connection is working
      async () => {
        try {
          // Use the isConnected method from our custom PrismaService
          const isConnected = await this.prisma.isConnected();
          return {
            database: {
              status: isConnected ? 'up' : 'down',
            },
          };
        } catch (error) {
          this.logger.error(`Database health check failed: ${error.message}`);
          return {
            database: {
              status: 'down',
              message: error.message,
            },
          };
        }
      },
      
      // Check memory usage
      () => this.memory.checkHeap('memory_heap', this.getMemoryHeapThreshold()),
      () => this.memory.checkRSS('memory_rss', this.getMemoryRssThreshold()),
      
      // Check disk usage
      () =>
        this.disk.checkStorage('disk', {
          thresholdPercent: this.getDiskThreshold(),
          path: '/',
        }),
    ]);
  }

  private getApiUrl(): string {
    return this.configService.get('HEALTH_CHECK_URL', 'http://localhost:3000/graphql');
  }

  private getMemoryHeapThreshold(): number {
    return this.configService.get('MEMORY_HEAP_THRESHOLD', 300 * 1024 * 1024); // 300MB
  }

  private getMemoryRssThreshold(): number {
    return this.configService.get('MEMORY_RSS_THRESHOLD', 500 * 1024 * 1024); // 500MB
  }

  private getDiskThreshold(): number {
    return this.configService.get('DISK_THRESHOLD', 0.9); // 90%
  }
}
