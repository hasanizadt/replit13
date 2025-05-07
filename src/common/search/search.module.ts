import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { LoggerModule } from '../logger/logger.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, LoggerModule, CacheModule],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
