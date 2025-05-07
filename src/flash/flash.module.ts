import { Module } from '@nestjs/common';
import { FlashService } from './flash.service';
import { FlashResolver } from './flash.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FlashService, FlashResolver],
  exports: [FlashService],
})
export class FlashModule {}