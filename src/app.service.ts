import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('AppService initialized');
  }

  getHello(): string {
    return 'Welcome to the NestJS E-commerce Backend API';
  }

  async getDatabaseStatus(): Promise<string> {
    try {
      // Execute a simple query to check if the database is connected
      // Using any to bypass TypeScript checking for $queryRaw
      await (this.prisma as any).$queryRaw`SELECT 1 as alive`;
      return 'Database is connected and healthy!';
    } catch (error) {
      this.logger.error(`Database status check failed: ${error.message}`);
      return `Database connection error: ${error.message}`;
    }
  }
}