import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportingResolver } from './reporting.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [ReportingService, ReportingResolver],
  exports: [ReportingService],
})
export class ReportingModule {}
