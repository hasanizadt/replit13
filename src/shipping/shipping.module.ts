import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingResolver } from './shipping.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ShippingService, ShippingResolver],
  exports: [ShippingService],
})
export class ShippingModule {}
