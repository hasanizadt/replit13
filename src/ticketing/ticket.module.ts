
import { Module } from '@nestjs/common';
import { TicketingService } from './ticketing.service';
import { TicketingResolver } from './ticketing.resolver';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TicketingService, TicketingResolver],
  exports: [TicketingService],
})
export class TicketModule {}
