import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    LoggerModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
