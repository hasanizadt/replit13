import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/logger/logger.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';
import { Notification } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, this should be configured to specific origins
  },
  namespace: 'notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  
  // Keep track of connected clients and their user IDs
  private connectedClients: Map<string, string[]> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('NotificationGateway');
  }

  afterInit(server: Server) {
    this.logger.log('Notification WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Get token from handshake auth
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn('Client attempted to connect without a token');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('app.jwtSecret'),
      });

      if (!payload || !payload.id) {
        this.logger.warn('Invalid token provided');
        client.disconnect();
        return;
      }

      const userId = payload.id;
      
      // Store client connection
      this.addConnectedClient(userId, client.id);
      
      // Join user to a room with their userId for targeted notifications
      client.join(`user:${userId}`);
      
      this.logger.log(`Client connected: ${client.id} for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error during socket connection: ${error.message}`, error.stack);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      // Remove client from connected clients
      this.removeConnectedClient(client.id);
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(`Error during socket disconnection: ${error.message}`, error.stack);
    }
  }

  /**
   * Subscribe to notifications for a specific user
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, userId: string) {
    try {
      // Add an additional room subscription if needed
      client.join(`notifications:${userId}`);
      return { success: true, message: 'Subscribed to notifications' };
    } catch (error) {
      this.logger.error(`Error during notification subscription: ${error.message}`, error.stack);
      return { success: false, message: 'Failed to subscribe to notifications' };
    }
  }

  /**
   * Unsubscribe from notifications for a specific user
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, userId: string) {
    try {
      client.leave(`notifications:${userId}`);
      return { success: true, message: 'Unsubscribed from notifications' };
    } catch (error) {
      this.logger.error(`Error during notification unsubscription: ${error.message}`, error.stack);
      return { success: false, message: 'Failed to unsubscribe from notifications' };
    }
  }

  /**
   * Join a specific notification room (e.g., for order updates)
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { room: string; userId: string }) {
    try {
      // Validate that the room belongs to the user
      if (data.room.includes(data.userId)) {
        client.join(data.room);
        return { success: true, room: data.room };
      }
      return { success: false, message: 'Unauthorized to join this room' };
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`, error.stack);
      return { success: false, message: 'Failed to join room' };
    }
  }

  /**
   * Leave a specific notification room
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    try {
      client.leave(room);
      return { success: true, room };
    } catch (error) {
      this.logger.error(`Error leaving room: ${error.message}`, error.stack);
      return { success: false, message: 'Failed to leave room' };
    }
  }

  /**
   * Mark a notification as read via WebSocket
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('markAsRead')
  handleMarkAsRead(client: Socket, notificationId: string) {
    // This will be handled by the NotificationService
    return { received: true, notificationId };
  }

  /**
   * Send a notification to a specific user
   */
  sendNotificationToUser(userId: string, notification: Notification) {
    try {
      this.server.to(`user:${userId}`).emit('notification', notification);
      this.logger.debug(`Sent notification to user ${userId}`);
    } catch (error) {
      this.logger.error(`Error sending notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Send a notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: Omit<Notification, 'userId'>) {
    try {
      userIds.forEach(userId => {
        this.server.to(`user:${userId}`).emit('notification', {
          ...notification,
          userId,
        });
      });
      this.logger.debug(`Sent notification to ${userIds.length} users`);
    } catch (error) {
      this.logger.error(`Error sending notifications: ${error.message}`, error.stack);
    }
  }

  /**
   * Send a broadcast notification to all connected clients
   */
  sendBroadcastNotification(notification: any) {
    try {
      this.server.emit('broadcast', notification);
      this.logger.debug('Sent broadcast notification');
    } catch (error) {
      this.logger.error(`Error sending broadcast: ${error.message}`, error.stack);
    }
  }

  /**
   * Send a notification to a specific room
   */
  sendNotificationToRoom(room: string, notification: any) {
    try {
      this.server.to(room).emit('roomNotification', notification);
      this.logger.debug(`Sent notification to room ${room}`);
    } catch (error) {
      this.logger.error(`Error sending room notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Get the number of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Check if a user has any connected clients
   */
  isUserConnected(userId: string): boolean {
    return this.connectedClients.has(userId) && this.connectedClients.get(userId).length > 0;
  }

  /**
   * Add a connected client
   */
  private addConnectedClient(userId: string, clientId: string): void {
    if (!this.connectedClients.has(userId)) {
      this.connectedClients.set(userId, []);
    }
    this.connectedClients.get(userId).push(clientId);
  }

  /**
   * Remove a connected client
   */
  private removeConnectedClient(clientId: string): void {
    for (const [userId, clients] of this.connectedClients.entries()) {
      const index = clients.indexOf(clientId);
      if (index !== -1) {
        clients.splice(index, 1);
        if (clients.length === 0) {
          this.connectedClients.delete(userId);
        }
        break;
      }
    }
  }
}
