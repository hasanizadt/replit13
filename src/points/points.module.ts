import { Module } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointsResolver } from './points.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [PointsService, PointsResolver],
  exports: [PointsService],
})
export class PointsModule {}
