import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponResolver } from './coupon.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { PointsModule } from '../points/points.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, PointsModule, AuthModule],
  providers: [CouponService, CouponResolver],
  exports: [CouponService],
})
export class CouponModule {}