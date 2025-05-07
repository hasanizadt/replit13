import { Module } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { AttributesResolver } from './attributes.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [AttributesService, AttributesResolver],
  exports: [AttributesService],
})
export class AttributesModule {}
