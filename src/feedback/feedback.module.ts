import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackResolver } from './feedback.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, LoggerModule, AuthModule],
  providers: [FeedbackService, FeedbackResolver],
  exports: [FeedbackService],
})
export class FeedbackModule {}
