import { Module } from '@nestjs/common';
import { SetupService } from './setup.service';
import { SetupResolver } from './setup.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../category/category.module';
import { ProductModule } from '../product/product.module';
import { BrandModule } from '../brand/brand.module';
import { AttributesModule } from '../attributes/attributes.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    UserModule,
    CategoryModule,
    ProductModule,
    BrandModule,
    AttributesModule,
  ],
  providers: [SetupService, SetupResolver],
  exports: [SetupService],
})
export class SetupModule {}
