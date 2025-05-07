import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandResolver } from './brand.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [BrandService, BrandResolver],
  exports: [BrandService],
})
export class BrandModule {}