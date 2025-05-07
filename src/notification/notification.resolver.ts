import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification, NotificationPagination } from './models/notification.model';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { SearchNotificationInput } from './dto/search-notification.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Create a new notification (Admin only)
   */
  @Mutation(() => Notification)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createNotification(
    @Args('createNotificationInput') createNotificationInput: CreateNotificationInput,
  ) {
    return this.notificationService.createNotification(createNotificationInput);
  }

  /**
   * Get all notifications for the current user (User only)
   */
  @Query(() => NotificationPagination)
  @UseGuards(AuthGuard)
  async getMyNotifications(
    @Args('searchInput') searchInput: SearchNotificationInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.findAllNotifications(userId, searchInput);
  }

  /**
   * Mark a notification as read (User only)
   */
  @Mutation(() => Notification)
  @UseGuards(AuthGuard)
  async markNotificationAsRead(
    @Args('updateNotificationInput') updateNotificationInput: UpdateNotificationInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.markNotificationAsRead(userId, updateNotificationInput);
  }

  /**
   * Mark all notifications as read (User only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async markAllNotificationsAsRead(@Context() context) {
    const userId = context.req.user.id;
    return this.notificationService.markAllNotificationsAsRead(userId);
  }

  /**
   * Delete a notification (User only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteNotification(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.notificationService.deleteNotification(userId, id);
  }

  /**
   * Delete all notifications (User only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteAllNotifications(@Context() context) {
    const userId = context.req.user.id;
    return this.notificationService.deleteAllNotifications(userId);
  }

  /**
   * Get unread notification count (User only)
   */
  @Query(() => Number)
  @UseGuards(AuthGuard)
  async getUnreadNotificationCount(@Context() context) {
    const userId = context.req.user.id;
    return this.notificationService.getUnreadNotificationCount(userId);
  }
  
  /**
   * Send a notification to multiple users (Admin only)
   */
  @Mutation(() => Number)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async sendNotificationToUsers(
    @Args({ name: 'userIds', type: () => [String] }) userIds: string[],
    @Args('createNotificationInput') createNotificationInput: CreateNotificationInput,
  ) {
    const { userId, ...notificationData } = createNotificationInput;
    return this.notificationService.sendNotificationToUsers(userIds, notificationData);
  }
}
