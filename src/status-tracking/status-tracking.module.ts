import { Module } from '@nestjs/common';
import { StatusTrackingService } from './status-tracking.service';
import { StatusTrackingResolver } from './status-tracking.resolver';
import { LoggerModule } from '../common/logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [
    CoreModule,
    LoggerModule, 
    AuthModule,
  ],
  providers: [StatusTrackingService, StatusTrackingResolver],
  exports: [StatusTrackingService],
})
export class StatusTrackingModule {}
