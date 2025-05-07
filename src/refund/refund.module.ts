import { Module } from '@nestjs/common';
import { RefundService } from './refund.service';
import { RefundResolver } from './refund.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RefundService, RefundResolver],
  exports: [RefundService],
})
export class RefundModule {}