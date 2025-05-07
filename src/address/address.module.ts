import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressResolver } from './address.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [AddressService, AddressResolver],
  exports: [AddressService],
})
export class AddressModule {}
