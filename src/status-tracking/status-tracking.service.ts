import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { CreateStatusTrackingInput, SearchStatusTrackingInput, StatusTrackingOrderBy } from './dto/status-tracking.input';

@Injectable()
export class StatusTrackingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('StatusTrackingService');
  }

  /**
   * Track a status change
   */
  async trackStatusChange(
    performedById: string,
    data: CreateStatusTrackingInput,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      const statusTracking = await this.prisma.statusTracking.create({
        data: {
          entityType: data.entityType,
          entityId: data.entityId,
          fromStatus: data.fromStatus,
          toStatus: data.toStatus,
          comment: data.comment,
          metadata: data.metadata,
          performedById,
          ipAddress,
          userAgent,
          orderId: data.orderId,
          productId: data.productId,
          paymentId: data.paymentId,
        },
      });

      return statusTracking;
    } catch (error) {
      this.logger.error(`Error tracking status change: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get status tracking history with pagination and filtering
   */
  async getStatusTrackingHistory(searchInput: SearchStatusTrackingInput) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        entityType, 
        entityId, 
        fromStatus, 
        toStatus, 
        performedById,
        startDate,
        endDate,
        orderBy = StatusTrackingOrderBy.CREATED_AT_DESC,
        orderByInput
      } = searchInput;
      
      const skip = (page - 1) * limit;

      const where: any = {};

      if (entityType) {
        where.entityType = entityType;
      }

      if (entityId) {
        where.entityId = entityId;
      }

      if (fromStatus) {
        where.fromStatus = fromStatus;
      }

      if (toStatus) {
        where.toStatus = toStatus;
      }

      if (performedById) {
        where.performedById = performedById;
      }

      if (startDate || endDate) {
        where.performedAt = {};
        
        if (startDate) {
          where.performedAt.gte = startDate;
        }
        
        if (endDate) {
          where.performedAt.lte = endDate;
        }
      }

      let orderByObj = {};
      
      // Support for new OrderByInput structure
      if (orderByInput) {
        const { field, direction } = orderByInput;
        orderByObj[field] = direction.toLowerCase();
      }
      // Backward compatibility with enum-based ordering
      else if (orderBy) {
        const [field, direction] = orderBy.split('_');
        orderByObj[field] = direction.toLowerCase();
      } else {
        orderByObj = { performedAt: 'desc' };
      }

      const [items, totalCount] = await Promise.all([
        this.prisma.statusTracking.findMany({
          where,
          skip,
          take: limit,
          orderBy: orderByObj,
        }),
        this.prisma.statusTracking.count({ where }),
      ]);

      return {
        items,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      this.logger.error(`Error getting status tracking history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get entity status tracking history
   */
  async getEntityStatusHistory(entityType: string, entityId: string) {
    try {
      const items = await this.prisma.statusTracking.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: {
          performedAt: 'desc',
        },
      });

      return items;
    } catch (error) {
      this.logger.error(`Error getting entity status history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get entity current status
   */
  async getEntityCurrentStatus(entityType: string, entityId: string) {
    try {
      // Get the latest status change for this entity
      const latestStatus = await this.prisma.statusTracking.findFirst({
        where: {
          entityType,
          entityId,
        },
        orderBy: {
          performedAt: 'desc',
        },
      });

      if (!latestStatus) {
        return null;
      }

      return latestStatus.toStatus;
    } catch (error) {
      this.logger.error(`Error getting entity current status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get entity status timeline
   */
  async getEntityStatusTimeline(entityType: string, entityId: string) {
    try {
      const items = await this.prisma.statusTracking.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: {
          performedAt: 'asc', // Ascending order for timeline
        },
      });

      return items;
    } catch (error) {
      this.logger.error(`Error getting entity status timeline: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate average time between statuses
   */
  async calculateAverageTimeBetweenStatuses(
    entityType: string,
    fromStatus: string,
    toStatus: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      // Find all status changes from the given status to the target status
      const fromStatusChanges = await this.prisma.statusTracking.findMany({
        where: {
          entityType,
          fromStatus,
          toStatus,
          ...(startDate && { performedAt: { gte: startDate } }),
          ...(endDate && { performedAt: { lte: endDate } }),
        },
        orderBy: {
          performedAt: 'asc',
        },
      });

      if (fromStatusChanges.length === 0) {
        return {
          averageTimeInSeconds: 0,
          averageTimeFormatted: '0 seconds',
          count: 0,
        };
      }

      // Group transitions by entityId to calculate time differences
      const transitions = fromStatusChanges.reduce((acc, curr) => {
        const entityId = curr.entityId;
        if (!acc[entityId]) {
          acc[entityId] = [];
        }
        acc[entityId].push(curr);
        return acc;
      }, {});

      let totalTimeInSeconds = 0;
      let count = 0;

      // Calculate the time difference for each entity
      Object.values(transitions).forEach((entityTransitions: any[]) => {
        if (entityTransitions.length >= 2) {
          for (let i = 1; i < entityTransitions.length; i++) {
            const fromTime = new Date(entityTransitions[i - 1].performedAt).getTime();
            const toTime = new Date(entityTransitions[i].performedAt).getTime();
            const diffInSeconds = (toTime - fromTime) / 1000;
            totalTimeInSeconds += diffInSeconds;
            count++;
          }
        }
      });

      if (count === 0) {
        return {
          averageTimeInSeconds: 0,
          averageTimeFormatted: '0 seconds',
          count: 0,
        };
      }

      const averageTimeInSeconds = totalTimeInSeconds / count;
      
      // Format the average time
      const formatTime = (seconds) => {
        if (seconds < 60) {
          return `${Math.round(seconds)} seconds`;
        } else if (seconds < 3600) {
          return `${Math.round(seconds / 60)} minutes`;
        } else if (seconds < 86400) {
          return `${Math.round(seconds / 3600)} hours`;
        } else {
          return `${Math.round(seconds / 86400)} days`;
        }
      };

      return {
        averageTimeInSeconds,
        averageTimeFormatted: formatTime(averageTimeInSeconds),
        count,
      };
    } catch (error) {
      this.logger.error(`Error calculating average time between statuses: ${error.message}`, error.stack);
      throw error;
    }
  }
}
