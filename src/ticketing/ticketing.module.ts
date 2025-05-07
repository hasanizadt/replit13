import { Module } from '@nestjs/common';
import { TicketingService } from './ticketing.service';
import { TicketingResolver } from './ticketing.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [PrismaModule, LoggerModule, GatewayModule],
  providers: [TicketingService, TicketingResolver],
  exports: [TicketingService],
})
export class TicketingModule {}
