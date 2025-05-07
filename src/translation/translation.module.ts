import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TranslationResolver } from './translation.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [TranslationService, TranslationResolver],
  exports: [TranslationService],
})
export class TranslationModule {}
