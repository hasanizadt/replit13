import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { NotificationGateway } from './notification.gateway';
import { SearchNotificationsInput, CreateNotificationInput } from './dto/notification.input';
import { NotificationType } from './models/notification.model';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly notificationGateway: NotificationGateway,
  ) {
    this.logger.setContext('NotificationService');
  }

  /**
   * Get user notifications with pagination and filtering
   */
  async getUserNotifications(userId: string, input: SearchNotificationsInput) {
    try {
      const { page, limit, unreadOnly, type } = input;
      const skip = (page - 1) * limit;
      
      const where: any = {
        userId,
      };
      
      if (unreadOnly) {
        where.read = false;
      }
      
      if (type) {
        where.type = type;
      }
      
      const [notifications, totalCount, unreadCount] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.notification.count({
          where,
        }),
        this.prisma.notification.count({
          where: {
            userId,
            read: false,
          },
        }),
      ]);
      
      return {
        notifications,
        totalCount,
        unreadCount,
        pageCount: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      this.logger.error(`Error getting user notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(userId: string, notificationId: string) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      const updatedNotification = await this.prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
      
      return updatedNotification;
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string, type?: NotificationType) {
    try {
      const where: any = {
        userId,
        read: false,
      };
      
      if (type) {
        where.type = type;
      }
      
      await this.prisma.notification.updateMany({
        where,
        data: { read: true },
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error marking all notifications as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(userId: string, notificationId: string) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      await this.prisma.notification.delete({
        where: { id: notificationId },
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string, type?: NotificationType) {
    try {
      const where: any = {
        userId,
      };
      
      if (type) {
        where.type = type;
      }
      
      await this.prisma.notification.deleteMany({
        where,
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting all notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create and send notifications to users
   */
  async createNotification(input: CreateNotificationInput) {
    try {
      return this.notificationGateway.sendNotificationToUsers(
        input.userIds,
        input.type,
        input.title,
        input.message,
        {
          link: input.link,
          imageUrl: input.imageUrl,
          metadata: input.metadata,
        },
      );
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send a broadcast notification to all users
   */
  async sendBroadcastNotification(
    type: NotificationType,
    title: string,
    message: string,
    data?: {
      link?: string;
      imageUrl?: string;
      metadata?: string;
    },
  ) {
    try {
      await this.notificationGateway.sendBroadcastNotification(
        type,
        title,
        message,
        data,
      );
      
      return true;
    } catch (error) {
      this.logger.error(`Error sending broadcast notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send notification about order status change
   */
  async sendOrderStatusNotification(
    orderId: string,
    status: string,
    userId: string,
  ) {
    try {
      await this.notificationGateway.sendOrderStatusNotification(
        orderId,
        status,
        userId,
      );
      
      return true;
    } catch (error) {
      this.logger.error(`Error sending order status notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send notification about payment status change
   */
  async sendPaymentStatusNotification(
    paymentId: string,
    status: string,
    userId: string,
  ) {
    try {
      await this.notificationGateway.sendPaymentStatusNotification(
        paymentId,
        status,
        userId,
      );
      
      return true;
    } catch (error) {
      this.logger.error(`Error sending payment status notification: ${error.message}`, error.stack);
      throw error;
    }
  }
}
