import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { MonitoringService } from './monitoring.service';
import { MonitoringData, LogEntry, SystemResourceInfo } from './models/monitoring.model';
import { LogQueryInput } from './dto/log-query.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver()
export class MonitoringResolver {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * Get the latest system metrics (Admin only)
   */
  @Query(() => MonitoringData)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getLatestMetrics() {
    return this.monitoringService.getLatestMetrics();
  }

  /**
   * Get recent system metrics (Admin only)
   */
  @Query(() => [MonitoringData])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRecentMetrics(
    @Args('count', { type: () => Int, defaultValue: 60 }) count: number,
  ) {
    return this.monitoringService.getRecentMetrics(count);
  }

  /**
   * Get system health information (Admin only)
   */
  @Query(() => SystemResourceInfo)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSystemHealth() {
    return this.monitoringService.getSystemHealth();
  }

  /**
   * Get logs with filtering and pagination (Admin only)
   */
  @Query(() => [LogEntry])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getLogs(@Args('query') query: LogQueryInput) {
    const result = await this.monitoringService.getLogs(query);
    return result.logs;
  }
}
