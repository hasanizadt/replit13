import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrderModule } from '../order/order.module';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';

@Module({
  imports: [PrismaModule, OrderModule],
  providers: [PaymentService, PaymentResolver],
  exports: [PaymentService],
})
export class PaymentModule {}