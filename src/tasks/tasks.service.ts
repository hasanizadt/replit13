import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  private readonly isSchedulingEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext('TasksService');
    // Allow disabling scheduling via environment variable
    this.isSchedulingEnabled = this.configService.get('ENABLE_SCHEDULING', true);

    if (!this.isSchedulingEnabled) {
      this.logger.warn('Task scheduling is disabled by configuration');
    }
  }

  // Run every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'clean-expired-tokens',
  })
  async cleanExpiredTokens() {
    if (!this.isSchedulingEnabled) return;

    this.logger.log('Running task: clean expired tokens');
    try {
      const now = new Date();
      const result = await (this.prisma as any).refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });
      this.logger.log(`Cleaned ${result.count} expired tokens`);
    } catch (error) {
      this.logger.error('Failed to clean expired tokens', error.stack);
    }
  }

  // Run every hour
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'check-active-flash-sales',
  })
  async checkActiveFlashSales() {
    if (!this.isSchedulingEnabled) return;

    this.logger.log('Running task: check active flash sales');
    try {
      const now = new Date();

      // Activate flash sales that should be active now
      const activatedSales = await this.prisma.product.updateMany({
        where: {
          // @ts-ignore startDate field missing from Prisma schema
          startDate: { lte: now },
          // @ts-ignore endDate field missing from Prisma schema
          endDate: { gte: now },
          isActive: false,
        },
        data: {
          isActive: true,
        },
      });

      // Deactivate flash sales that are expired
      const deactivatedSales = await this.prisma.product.updateMany({
        where: {
          // @ts-ignore endDate field missing from Prisma schema
          endDate: { lt: now },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      this.logger.log(`Flash sales updated: ${activatedSales.count} activated, ${deactivatedSales.count} deactivated`);
    } catch (error) {
      this.logger.error('Failed to check active flash sales', error.stack);
    }
  }

  // Run every 6 hours
  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'check-abandoned-carts',
  })
  async checkAbandonedCarts() {
    if (!this.isSchedulingEnabled) return;

    this.logger.log('Running task: check abandoned carts');
    try {
      const abandonedTimeThreshold = new Date();
      // Set threshold to 24 hours ago
      abandonedTimeThreshold.setHours(abandonedTimeThreshold.getHours() - 24);

      // Find cart items that haven't been updated in 24 hours
      const abandonedCarts = await this.prisma.cart.findMany({
        where: {
          updatedAt: {
            lt: abandonedTimeThreshold,
          },
        },
        select: {
          id: true,
          userId: true,
          productId: true,
          updatedAt: true,
        },
      });

      this.logger.log(`Found ${abandonedCarts.length} abandoned carts`);

      // Here you could implement logic to send reminders, 
      // or perform other actions with abandoned carts
    } catch (error) {
      this.logger.error('Failed to check abandoned carts', error.stack);
    }
  }

  // Run every day at 1:00 AM
  @Cron('0 1 * * *', {
    name: 'generate-daily-reports',
  })
  async generateDailyReports() {
    if (!this.isSchedulingEnabled) return;

    this.logger.log('Running task: generate daily reports');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);

      // Get orders from yesterday
      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: {
            gte: yesterday,
            lte: endOfYesterday,
          },
        },
        include: {
          items: true,
        },
      });

      // Calculate totals
      const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
      const totalOrders = orders.length;
      const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);

      this.logger.log(`Daily report for ${yesterday.toISOString().split('T')[0]}: ${totalOrders} orders, ${totalItems} items, $${totalSales.toFixed(2)} in sales`);

      // Here you could save this report to the database,
      // or send it via email to administrators
    } catch (error) {
      this.logger.error('Failed to generate daily reports', error.stack);
    }
  }

  // Run once at application startup (after 10 seconds)
  @Timeout(10000)
  async handleStartupTasks() {
    if (!this.isSchedulingEnabled) return;

    this.logger.log('Running startup tasks');
    try {
      // Perform any startup tasks here
      // For example, ensure critical configuration is valid

      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('Database connection verified');

      // You could check other services here as well
    } catch (error) {
      this.logger.error('Failed to run startup tasks', error.stack);
    }
  }

  // Run every 30 minutes
  @Interval(30 * 60 * 1000)
  async handleIntervalTasks() {
    if (!this.isSchedulingEnabled) return;

    this.logger.log('Running interval tasks');
    try {
      // Perform tasks that need to run on a regular interval
      // For example, check for pending notifications

      const pendingNotificationCount = await this.prisma.notification.count({
        where: {
          read: false,
        },
      });

      this.logger.log(`There are ${pendingNotificationCount} pending notifications`);

      // You could process these notifications here
    } catch (error) {
      this.logger.error('Failed to run interval tasks', error.stack);
    }
  }
}