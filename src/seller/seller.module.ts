import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerResolver } from './seller.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SellerService, SellerResolver],
  exports: [SellerService],
})
export class SellerModule {}