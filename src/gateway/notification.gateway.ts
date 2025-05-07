import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger/logger.service';
import { WSAuthMiddleware } from './ws-auth.middleware';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
  ) {
    this.logger.setContext('NotificationGateway');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHandshake(client);
      
      if (!token) {
        this.logger.warn(`Client ${client.id} attempted to connect without a token`);
        client.disconnect();
        return;
      }
      
      const user = await this.verifyToken(token);
      
      if (!user) {
        this.logger.warn(`Client ${client.id} provided an invalid token`);
        client.disconnect();
        return;
      }
      
      // Store user data in socket
      client.data.user = user;
      
      // Add client to the connected clients map
      if (!this.connectedClients.has(user.id)) {
        this.connectedClients.set(user.id, new Set());
      }
      
      this.connectedClients.get(user.id).add(client.id);
      
      // Join user to their own room for direct messages
      client.join(`user:${user.id}`);
      
      // If user is admin, join admin room
      if (user.role === 'ADMIN') {
        client.join('admin');
      }
      
      // If user is seller, join seller room
      if (user.role === 'SELLER') {
        client.join('seller');
        
        // If seller has a seller profile, join their seller room
        const seller = await this.prisma.seller.findFirst({
          where: { userId: user.id },
        });
        
        if (seller) {
          client.join(`seller:${seller.id}`);
        }
      }
      
      this.logger.log(`Client connected: ${client.id} (User: ${user.id}, Role: ${user.role})`);
      
      // Send unread notifications count
      const unreadCount = await this.prisma.notification.count({
        where: {
          userId: user.id,
          read: false,
        },
      });
      
      client.emit('unreadCount', { count: unreadCount });
    } catch (error) {
      this.logger.error(`Error handling connection: ${error.message}`, error.stack);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const user = client.data.user;
      
      if (user) {
        // Remove client from the connected clients map
        if (this.connectedClients.has(user.id)) {
          this.connectedClients.get(user.id).delete(client.id);
          
          // If no more clients for this user, remove the user from the map
          if (this.connectedClients.get(user.id).size === 0) {
            this.connectedClients.delete(user.id);
          }
        }
        
        this.logger.log(`Client disconnected: ${client.id} (User: ${user.id})`);
      } else {
        this.logger.log(`Client disconnected: ${client.id} (Unknown user)`);
      }
    } catch (error) {
      this.logger.error(`Error handling disconnection: ${error.message}`, error.stack);
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id: string },
  ) {
    try {
      const user = client.data.user;
      
      if (!user) {
        return { error: 'Unauthorized' };
      }
      
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: data.id,
          userId: user.id,
        },
      });
      
      if (!notification) {
        return { error: 'Notification not found' };
      }
      
      await this.prisma.notification.update({
        where: { id: data.id },
        data: { read: true },
      });
      
      // Get updated unread count
      const unreadCount = await this.prisma.notification.count({
        where: {
          userId: user.id,
          read: false,
        },
      });
      
      // Emit updated unread count to all client instances of this user
      this.server.to(`user:${user.id}`).emit('unreadCount', { count: unreadCount });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error.message}`, error.stack);
      return { error: 'An error occurred' };
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type?: NotificationType },
  ) {
    try {
      const user = client.data.user;
      
      if (!user) {
        return { error: 'Unauthorized' };
      }
      
      const where: any = {
        userId: user.id,
        read: false,
      };
      
      if (data.type) {
        where.type = data.type;
      }
      
      await this.prisma.notification.updateMany({
        where,
        data: { read: true },
      });
      
      // Emit updated unread count (0) to all client instances of this user
      this.server.to(`user:${user.id}`).emit('unreadCount', { count: 0 });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marking all notifications as read: ${error.message}`, error.stack);
      return { error: 'An error occurred' };
    }
  }

  /**
   * Send a notification to specific users
   */
  async sendNotificationToUsers(
    userIds: string[],
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
      const notifications = [];
      
      // Create notifications for each user
      for (const userId of userIds) {
        const notification = await this.prisma.notification.create({
          data: {
            userId,
            type,
            title,
            message,
            link: data?.link,
            imageUrl: data?.imageUrl,
            metadata: data?.metadata,
            read: false,
          },
        });
        
        notifications.push(notification);
        
        // Emit notification to the user room
        this.server.to(`user:${userId}`).emit('notification', notification);
        
        // Update unread count for the user
        const unreadCount = await this.prisma.notification.count({
          where: {
            userId,
            read: false,
          },
        });
        
        this.server.to(`user:${userId}`).emit('unreadCount', { count: unreadCount });
      }
      
      return notifications;
    } catch (error) {
      this.logger.error(`Error sending notification to users: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send a notification to all connected clients
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
      // Get all users except admins (they don't need system notifications)
      const users = await this.prisma.user.findMany({
        where: {
          role: { not: 'ADMIN' },
        },
        select: { id: true },
      });
      
      const userIds = users.map(user => user.id);
      
      return this.sendNotificationToUsers(userIds, type, title, message, data);
    } catch (error) {
      this.logger.error(`Error sending broadcast notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send a notification to all admins
   */
  async sendAdminNotification(
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
      // Get all admin users
      const admins = await this.prisma.user.findMany({
        where: {
          role: 'ADMIN',
        },
        select: { id: true },
      });
      
      const adminIds = admins.map(admin => admin.id);
      
      return this.sendNotificationToUsers(adminIds, type, title, message, data);
    } catch (error) {
      this.logger.error(`Error sending admin notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send a notification to a specific seller
   */
  async sendSellerNotification(
    sellerId: string,
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
      // Get the seller's user ID
      const seller = await this.prisma.seller.findFirst({
        where: { id: sellerId },
        select: { userId: true },
      });
      
      if (!seller) {
        throw new Error(`Seller not found: ${sellerId}`);
      }
      
      return this.sendNotificationToUsers([seller.userId], type, title, message, data);
    } catch (error) {
      this.logger.error(`Error sending seller notification: ${error.message}`, error.stack);
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
      // Get order details for richer notification
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          total: true,
        },
      });
      
      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }
      
      let title = '';
      let message = '';
      
      switch (status) {
        case 'PENDING':
          title = 'Order Received';
          message = `Your order #${order.orderNumber} has been received and is pending.`;
          break;
        case 'PROCESSING':
          title = 'Order Processing';
          message = `Your order #${order.orderNumber} is now being processed.`;
          break;
        case 'SHIPPED':
          title = 'Order Shipped';
          message = `Your order #${order.orderNumber} has been shipped.`;
          break;
        case 'DELIVERED':
          title = 'Order Delivered';
          message = `Your order #${order.orderNumber} has been delivered.`;
          break;
        case 'CANCELLED':
          title = 'Order Cancelled';
          message = `Your order #${order.orderNumber} has been cancelled.`;
          break;
        case 'REFUNDED':
          title = 'Order Refunded';
          message = `Your order #${order.orderNumber} has been refunded.`;
          break;
        default:
          title = 'Order Update';
          message = `Your order #${order.orderNumber} has been updated to ${status}.`;
      }
      
      return this.sendNotificationToUsers(
        [userId],
        NotificationType.ORDER,
        title,
        message,
        {
          link: `/orders/${orderId}`,
          metadata: JSON.stringify({
            orderId,
            orderNumber: order.orderNumber,
            status,
            total: order.total,
          }),
        },
      );
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
      // Get payment details for richer notification
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        select: {
          id: true,
          amount: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
      });
      
      if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
      }
      
      let title = '';
      let message = '';
      
      switch (status) {
        case 'PENDING':
          title = 'Payment Pending';
          message = `Your payment of $${payment.amount} for order #${payment.order.orderNumber} is pending.`;
          break;
        case 'COMPLETED':
          title = 'Payment Successful';
          message = `Your payment of $${payment.amount} for order #${payment.order.orderNumber} was successful.`;
          break;
        case 'FAILED':
          title = 'Payment Failed';
          message = `Your payment of $${payment.amount} for order #${payment.order.orderNumber} has failed.`;
          break;
        case 'REFUNDED':
          title = 'Payment Refunded';
          message = `Your payment of $${payment.amount} for order #${payment.order.orderNumber} has been refunded.`;
          break;
        default:
          title = 'Payment Update';
          message = `Your payment for order #${payment.order.orderNumber} has been updated to ${status}.`;
      }
      
      return this.sendNotificationToUsers(
        [userId],
        NotificationType.PAYMENT,
        title,
        message,
        {
          link: `/orders/${payment.order.id}`,
          metadata: JSON.stringify({
            paymentId,
            orderId: payment.order.id,
            orderNumber: payment.order.orderNumber,
            status,
            amount: payment.amount,
          }),
        },
      );
    } catch (error) {
      this.logger.error(`Error sending payment status notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    const handshake = client.handshake;
    
    // Try to get the token from the auth query parameter
    if (handshake.query && handshake.query.token) {
      return handshake.query.token as string;
    }
    
    // Try to get the token from the authorization header
    if (handshake.headers && handshake.headers.authorization) {
      const auth = handshake.headers.authorization as string;
      const parts = auth.split(' ');
      
      if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
      }
    }
    
    return undefined;
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('app.jwtSecret'),
      });
      
      // Get user from database to ensure they still exist and have the same role
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          role: true,
          isActive: true,
        },
      });
      
      if (!user || !user.isActive) {
        return null;
      }
      
      return user;
    } catch (error) {
      this.logger.error(`Error verifying token: ${error.message}`, error.stack);
      return null;
    }
  }
}
