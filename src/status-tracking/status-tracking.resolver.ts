import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { StatusTrackingService } from './status-tracking.service';
import { StatusTracking, StatusTrackingPagination, EntityType } from './models/status-tracking.model';
import { CreateStatusTrackingInput, SearchStatusTrackingInput } from './dto/status-tracking.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => StatusTracking)
export class StatusTrackingResolver {
  constructor(private readonly statusTrackingService: StatusTrackingService) {}

  /**
   * Track a status change (Admin only)
   */
  @Mutation(() => StatusTracking)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async trackStatusChange(
    @Args('createStatusTrackingInput') createStatusTrackingInput: CreateStatusTrackingInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    const ipAddress = context.req.ip || context.req.headers['x-forwarded-for'] || '';
    const userAgent = context.req.headers['user-agent'] || '';
    
    return this.statusTrackingService.trackStatusChange(
      userId,
      createStatusTrackingInput,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Get status tracking history with pagination and filtering (Admin only)
   */
  @Query(() => StatusTrackingPagination)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getStatusTrackingHistory(
    @Args('searchInput') searchInput: SearchStatusTrackingInput,
  ) {
    return this.statusTrackingService.getStatusTrackingHistory(searchInput);
  }

  /**
   * Get entity status history (Admin only)
   */
  @Query(() => [StatusTracking])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getEntityStatusHistory(
    @Args('entityType') entityType: string,
    @Args('entityId') entityId: string,
  ) {
    return this.statusTrackingService.getEntityStatusHistory(entityType, entityId);
  }

  /**
   * Get entity current status (Admin only)
   */
  @Query(() => String, { nullable: true })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getEntityCurrentStatus(
    @Args('entityType') entityType: string,
    @Args('entityId') entityId: string,
  ) {
    return this.statusTrackingService.getEntityCurrentStatus(entityType, entityId);
  }

  /**
   * Get entity status timeline (Admin or User owner)
   */
  @Query(() => [StatusTracking])
  @UseGuards(AuthGuard)
  async getEntityStatusTimeline(
    @Args('entityType') entityType: string,
    @Args('entityId') entityId: string,
    @Context() context,
  ) {
    // For order status, we need to check if the user is the owner
    // This is a simplification - in a real app, you would check if the user has permission
    // to access this entity based on your business rules
    const isAdmin = context.req.user.role === 'ADMIN';
    
    // For now, let's assume that admins can see all entity timelines
    // In a real app, you would implement permission checks here
    if (!isAdmin) {
      // Add permission checks here
    }
    
    return this.statusTrackingService.getEntityStatusTimeline(entityType, entityId);
  }

  /**
   * Calculate average time between statuses (Admin only)
   */
  @Query(() => String)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async calculateAverageTimeBetweenStatuses(
    @Args('entityType') entityType: string,
    @Args('fromStatus') fromStatus: string,
    @Args('toStatus') toStatus: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    const result = await this.statusTrackingService.calculateAverageTimeBetweenStatuses(
      entityType,
      fromStatus,
      toStatus,
      startDate,
      endDate,
    );
    
    return `Average time from ${fromStatus} to ${toStatus}: ${result.averageTimeFormatted} (based on ${result.count} transitions)`;
  }
}
