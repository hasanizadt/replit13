import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResolver } from './analytics.resolver';
import { LoggerModule } from '../common/logger/logger.module';
import { CacheModule } from '../common/cache/cache.module';
import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [
    CoreModule,
    LoggerModule, 
    CacheModule, 
    AuthModule,
  ],
  providers: [AnalyticsService, AnalyticsResolver],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
