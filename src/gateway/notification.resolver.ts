import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { 
  Notification, 
  NotificationPagination, 
  NotificationType 
} from './models/notification.model';
import {
  SearchNotificationsInput,
  MarkNotificationAsReadInput,
  MarkAllNotificationsAsReadInput,
  DeleteNotificationInput,
  DeleteAllNotificationsInput,
  CreateNotificationInput,
} from './dto/notification.input';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Get notifications for the current user
   */
  @Query(() => NotificationPagination)
  @UseGuards(AuthGuard)
  async getMyNotifications(
    @Args('input') input: SearchNotificationsInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.getUserNotifications(userId, input);
  }

  /**
   * Mark a notification as read
   */
  @Mutation(() => Notification)
  @UseGuards(AuthGuard)
  async markNotificationAsRead(
    @Args('input') input: MarkNotificationAsReadInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.markAsRead(userId, input.id);
  }

  /**
   * Mark all notifications as read
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async markAllNotificationsAsRead(
    @Args('input', { nullable: true }) input: MarkAllNotificationsAsReadInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.markAllAsRead(userId, input?.type);
  }

  /**
   * Delete a notification
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteNotification(
    @Args('input') input: DeleteNotificationInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.deleteNotification(userId, input.id);
  }

  /**
   * Delete all notifications
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteAllNotifications(
    @Args('input', { nullable: true }) input: DeleteAllNotificationsInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.deleteAllNotifications(userId, input?.type);
  }

  /**
   * Create and send notifications to users (Admin only)
   */
  @Mutation(() => [Notification])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createNotification(
    @Args('input') input: CreateNotificationInput,
  ) {
    return this.notificationService.createNotification(input);
  }

  /**
   * Send a broadcast notification to all users (Admin only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async sendBroadcastNotification(
    @Args('type') type: NotificationType,
    @Args('title') title: string,
    @Args('message') message: string,
    @Args('link', { nullable: true }) link?: string,
  ) {
    return this.notificationService.sendBroadcastNotification(type, title, message, { link });
  }
}
