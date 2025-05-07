import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MonitoringResolver } from './monitoring.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [MonitoringService, MonitoringResolver],
  exports: [MonitoringService],
})
export class MonitoringModule {}
