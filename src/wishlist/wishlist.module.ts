import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistResolver } from './wishlist.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WishlistService, WishlistResolver],
  exports: [WishlistService],
})
export class WishlistModule {}