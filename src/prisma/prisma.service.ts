import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    this.logger.log('PrismaService initialized with PrismaClient');
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  async onModuleInit() {
    try {
      this.logger.log('Attempting to connect to the database...');
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      this.logger.error(`Failed to connect to the database: ${error.message}`);
      // Don't rethrow the error to prevent app crash
      this.logger.warn('Application will continue without database connection');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from the database');
    } catch (error) {
      this.logger.error(`Error disconnecting from database: ${error.message}`);
    }
  }

  async cleanDatabase() {
    const nodeEnv = process.env?.NODE_ENV || 'development';
    if (nodeEnv === 'production') {
      throw new Error('Database cleaning is not allowed in production');
    }

    const models = [
      'bank',
      'flash', 
      'notification',
      'orderSeller',
      'paymentTransaction',
      'pointTransaction',
      'refund',
      'refundable',
      'seller',
      'shippingMethod',
      'shippingZone',
      'tag',
      'ticketDepartment'
    ];

    return Promise.all(
      models.map(async (modelName) => {
        try {
          // @ts-ignore
          if (this[modelName]) {
            // @ts-ignore
            return await this[modelName].deleteMany();
          } else {
            this.logger.warn(`Model ${modelName} not found`);
            return { count: 0 };
          }
        } catch (error) {
          this.logger.error(`Error deleting from model ${modelName}: ${error.message}`);
          return { count: 0 };
        }
      })
    );
  }

  async softDelete(modelName: string, where: any) {
    // @ts-ignore
    if (!this[modelName]) {
      throw new Error(`Model ${modelName} not found`);
    }
    
    // @ts-ignore
    return this[modelName].update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(modelName: string, where: any) {
    // @ts-ignore
    if (!this[modelName]) {
      throw new Error(`Model ${modelName} not found`);
    }
    
    // @ts-ignore
    return this[modelName].update({
      where,
      data: {
        deletedAt: null,
      },
    });
  }
}
