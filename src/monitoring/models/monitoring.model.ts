import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class SystemResourceInfo {
  @Field(() => Float)
  cpuUsage: number;

  @Field(() => Float)
  memoryUsage: number;

  @Field(() => Float)
  memoryTotal: number;

  @Field(() => Float)
  memoryFree: number;

  @Field(() => Float)
  diskUsage: number;

  @Field(() => Float)
  diskTotal: number;

  @Field(() => Float)
  diskFree: number;

  @Field(() => Int)
  uptimeSeconds: number;
}

@ObjectType()
export class RequestMetrics {
  @Field(() => Int)
  totalRequests: number;

  @Field(() => Int)
  successfulRequests: number;

  @Field(() => Int)
  failedRequests: number;

  @Field(() => Float)
  averageResponseTime: number;

  @Field(() => Float)
  p95ResponseTime: number;

  @Field(() => Float)
  p99ResponseTime: number;

  @Field(() => Int)
  activeConnections: number;

  @Field(() => Int)
  requestsPerMinute: number;
}

@ObjectType()
export class DatabaseMetrics {
  @Field(() => Int)
  activeConnections: number;

  @Field(() => Int)
  maxConnections: number;

  @Field(() => Float)
  connectionUsagePercent: number;

  @Field(() => Float)
  averageQueryTime: number;

  @Field(() => Int)
  queriesPerMinute: number;

  @Field(() => Int)
  slowQueries: number;
}

@ObjectType()
export class CacheMetrics {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Float)
  hitRate: number;

  @Field(() => Float)
  missRate: number;

  @Field(() => Int)
  evictions: number;

  @Field(() => Float)
  averageGetTime: number;
}

@ObjectType()
export class MonitoringData {
  @Field(() => SystemResourceInfo)
  system: SystemResourceInfo;

  @Field(() => RequestMetrics)
  requests: RequestMetrics;

  @Field(() => DatabaseMetrics, { nullable: true })
  database?: DatabaseMetrics;

  @Field(() => CacheMetrics, { nullable: true })
  cache?: CacheMetrics;

  @Field(() => String)
  timestamp: string;
}

@ObjectType()
export class LogEntry {
  @Field(() => String)
  timestamp: string;

  @Field(() => String)
  level: string;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  context?: string;

  @Field(() => String, { nullable: true })
  stack?: string;

  @Field(() => String, { nullable: true })
  requestId?: string;

  @Field(() => String, { nullable: true })
  userId?: string;
}

@ObjectType()
export class AlertConfig {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  condition: string;

  @Field(() => String)
  threshold: string;

  @Field(() => Boolean)
  enabled: boolean;

  @Field(() => [String])
  notificationChannels: string[];
}

@ObjectType()
export class Alert {
  @Field(() => String)
  id: string;

  @Field(() => String)
  alertConfigId: string;

  @Field(() => String)
  timestamp: string;

  @Field(() => String)
  level: string;

  @Field(() => String)
  message: string;

  @Field(() => Boolean)
  acknowledged: boolean;
}
