import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagResolver } from './tag.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TagService, TagResolver],
  exports: [TagService],
})
export class TagModule {}