import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { SearchNotificationInput } from './dto/search-notification.input';
import { NotificationGateway } from './websocket/notification.gateway';
import { NotificationType } from '../common/enums/notification-type.enum'; // Updated import statement
import { OrderByInput } from '../common/dto/order-by.input';

// Helper function to get the order by clause based on different input formats
function getOrderByClause(orderByInput?: OrderByInput | any, sortBy = 'createdAt', sortDirection = 'desc'): any {
  // New format with OrderByInput object
  if (orderByInput && typeof orderByInput === 'object' && orderByInput.field) {
    return { [orderByInput.field]: orderByInput.direction };
  }
  
  // Legacy string format (can also accept just a field name)
  if (sortBy && typeof sortBy === 'string') {
    return { [sortBy]: sortDirection };
  }
  
  // Default sorting
  return { createdAt: 'desc' };
}


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
   * Create a new notification
   */
  async createNotification(data: CreateNotificationInput) {
    try {
      this.logger.debug(`Creating notification for user ${data.userId}`);

      const notification = await (this.prisma as any).notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          link: data.link || null,
          imageUrl: data.image || null, // Changed image to imageUrl to match Prisma schema
          user: {
            connect: { id: data.userId },
          },
        },
      });

      // Send real-time notification if user is connected
      if (this.notificationGateway.isUserConnected(data.userId)) {
        this.notificationGateway.sendNotificationToUser(data.userId, notification);
      }

      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all notifications for a user with pagination and filtering
   */
  async findAllNotifications(userId: string, searchInput: SearchNotificationInput) {
    try {
      const { page, limit, type, read, sortBy = 'createdAt', sortDirection = 'desc', orderBy } = searchInput;
      const skip = (page - 1) * limit;

      // Create filters
      const where: any = { userId };

      if (type !== undefined) {
        where.type = type;
      }

      if (read !== undefined) { // Changed isRead to read
        where.read = read; // Changed isRead to read
      }

      // Query notifications with pagination
      const [notifications, totalCount, unreadCount] = await Promise.all([
        (this.prisma as any).notification.findMany({
          where,
          orderBy: getOrderByClause(orderBy, sortBy, sortDirection),
          skip,
          take: limit,
        }),
        (this.prisma as any).notification.count({ where }),
        (this.prisma as any).notification.count({
          where: {
            userId,
            read: false, // Changed isRead to read
          },
        }),
      ]);

      return {
        notifications,
        totalCount,
        unreadCount,
      };
    } catch (error) {
      this.logger.error(`Failed to find notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(userId: string, data: UpdateNotificationInput) {
    try {
      // Ensure the notification belongs to the user
      const notification = await (this.prisma as any).notification.findFirst({
        where: {
          id: data.id,
          userId,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Update the notification
      const updatedNotification = await (this.prisma as any).notification.update({
        where: { id: data.id },
        data: { 
          read: data.read,
          updatedAt: new Date()
        }
      });

      return updatedNotification;
    } catch (error) {
      this.logger.error(`Failed to update notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string) {
    try {
      await (this.prisma as any).notification.updateMany({
        where: {
          userId,
          read: false, // Changed isRead to read
        },
        data: {
          read: true, // Changed isRead to read
        },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(userId: string, notificationId: string) {
    try {
      // Ensure the notification belongs to the user
      const notification = await (this.prisma as any).notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      // Delete the notification
      await (this.prisma as any).notification.delete({
        where: { id: notificationId },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string) {
    try {
      await (this.prisma as any).notification.deleteMany({
        where: { userId },
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to delete all notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadNotificationCount(userId: string) {
    try {
      const count = await (this.prisma as any).notification.count({
        where: {
          userId,
          read: false, // Changed isRead to read
        },
      });

      return count;
    } catch (error) {
      this.logger.error(`Failed to get unread notification count: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send a notification to multiple users (batch creation)
   */
  async sendNotificationToUsers(userIds: string[], notificationData: Omit<CreateNotificationInput, 'userId'>) {
    try {
      this.logger.debug(`Sending notification to ${userIds.length} users`);

      const notifications = await (this.prisma as any).notification.createMany({
        data: userIds.map(userId => ({
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          link: notificationData.link || null,
          imageUrl: notificationData.image || null, // Changed image to imageUrl
          userId,
        })),
      });

      // Send real-time notifications to connected users
      this.notificationGateway.sendNotificationToUsers(
        userIds, 
        {
          id: '', // Each notification will have its own ID
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          link: notificationData.link || null,
          imageUrl: notificationData.image || null, // Changed image to imageUrl
          read: false, // Changed isRead to read
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {}, // Added missing required field
        }
      );

      return notifications.count;
    } catch (error) {
      this.logger.error(`Failed to send notifications to users: ${error.message}`, error.stack);
      throw error;
    }
  }
}