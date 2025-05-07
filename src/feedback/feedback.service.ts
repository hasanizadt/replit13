import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { 
  CreateFeedbackInput, 
  UpdateFeedbackInput, 
  UpdateFeedbackStatusInput, 
  SearchFeedbackInput 
} from './dto/feedback.input';
import { FeedbackType, FeedbackStatus } from './models/feedback.model';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('FeedbackService');
  }

  /**
   * Create a new feedback entry
   */
  async createFeedback(userId: string, data: CreateFeedbackInput) {
    try {
      const feedback = await this.prisma.feedback.create({
        data: {
          user: { connect: { id: userId } },
          ...(data.productId ? { product: { connect: { id: data.productId } } } : {}),
          ...(data.orderId ? { order: { connect: { id: data.orderId } } } : {}),
          ...(data.sellerId ? { seller: { connect: { id: data.sellerId } } } : {}),
          rating: data.rating,
          // Map the fields to match Prisma schema
          message: data.comment, // 'message' in Prisma schema corresponds to 'comment' in GraphQL
          type: data.type, // Both use 'type'
          status: FeedbackStatus.PENDING, // Both use 'status'
        },
      });

      return feedback;
    } catch (error) {
      this.logger.error(`Error creating feedback: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an existing feedback
   */
  async updateFeedback(userId: string, data: UpdateFeedbackInput) {
    try {
      const feedback = await this.prisma.feedback.findFirst({
        where: {
          id: data.id,
          userId,
        },
      });

      if (!feedback) {
        throw new Error('Feedback not found or you do not have permission to update it');
      }

      // Only allow updating if feedback is still in PENDING status
      if (feedback.status !== FeedbackStatus.PENDING) {
        throw new Error('Can only update feedback that is in PENDING status');
      }

      const updatedFeedback = await this.prisma.feedback.update({
        where: { id: data.id },
        data: {
          ...( data.rating !== undefined ? { rating: data.rating } : {}),
          ...( data.comment !== undefined ? { message: data.comment } : {}), // Using message field instead of comment
        },
      });

      return updatedFeedback;
    } catch (error) {
      this.logger.error(`Error updating feedback: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update feedback status (Admin only)
   */
  async updateFeedbackStatus(data: UpdateFeedbackStatusInput) {
    try {
      const feedback = await this.prisma.feedback.findUnique({
        where: { id: data.id },
      });

      if (!feedback) {
        throw new Error('Feedback not found');
      }

      const updatedFeedback = await this.prisma.feedback.update({
        where: { id: data.id },
        data: {
          status: data.status,
        },
      });

      return updatedFeedback;
    } catch (error) {
      this.logger.error(`Error updating feedback status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a feedback entry
   */
  async deleteFeedback(userId: string, id: string, isAdmin: boolean = false) {
    try {
      // If not admin, check if the feedback belongs to the user
      if (!isAdmin) {
        const feedback = await this.prisma.feedback.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!feedback) {
          throw new Error('Feedback not found or you do not have permission to delete it');
        }
      }

      await this.prisma.feedback.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(`Error deleting feedback: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all feedback with pagination and filtering
   */
  async getAllFeedback(searchInput: SearchFeedbackInput) {
    try {
      const { page, limit, type, status, productId, orderId, sellerId, userId, rating, search } = searchInput;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      if (productId) {
        where.productId = productId;
      }

      if (orderId) {
        where.orderId = orderId;
      }

      if (sellerId) {
        where.sellerId = sellerId;
      }

      if (userId) {
        where.userId = userId;
      }

      if (rating) {
        where.rating = rating;
      }

      if (search) {
        where.OR = [
          { message: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [feedbacks, totalCount] = await Promise.all([
        this.prisma.feedback.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        }),
        this.prisma.feedback.count({ where }),
      ]);

      // Calculate average rating if there are records
      let averageRating = null;
      if (totalCount > 0) {
        const sumRating = await this.prisma.feedback.aggregate({
          where,
          _sum: {
            rating: true,
          },
        });
        
        averageRating = sumRating._sum.rating / totalCount;
      }

      return {
        feedbacks,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        averageRating,
      };
    } catch (error) {
      this.logger.error(`Error getting all feedback: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get feedback by ID
   */
  async getFeedbackById(id: string) {
    try {
      const feedback = await this.prisma.feedback.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!feedback) {
        throw new Error('Feedback not found');
      }

      return feedback;
    } catch (error) {
      this.logger.error(`Error getting feedback by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user's own feedback with pagination and filtering
   */
  async getUserFeedback(userId: string, searchInput: SearchFeedbackInput) {
    try {
      searchInput.userId = userId;
      return this.getAllFeedback(searchInput);
    } catch (error) {
      this.logger.error(`Error getting user feedback: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get feedback summary for an entity (product, seller, etc.)
   */
  async getFeedbackSummary(type: FeedbackType, entityId: string) {
    try {
      const where: any = {
        type,
        status: FeedbackStatus.APPROVED,
      };

      // Set the appropriate filter based on the type
      switch (type) {
        case FeedbackType.PRODUCT:
          where.productId = entityId;
          break;
        case FeedbackType.SELLER:
          where.sellerId = entityId;
          break;
        case FeedbackType.ORDER:
          where.orderId = entityId;
          break;
        default:
          throw new Error(`Unsupported feedback type for summary: ${type}`);
      }

      const totalFeedbacks = await this.prisma.feedback.count({ where });

      if (totalFeedbacks === 0) {
        return {
          totalFeedbacks: 0,
          averageRating: 0,
          oneStar: 0,
          twoStars: 0,
          threeStars: 0,
          fourStars: 0,
          fiveStars: 0,
        };
      }

      // Get counts for each rating
      const [oneStar, twoStars, threeStars, fourStars, fiveStars, sumRating] = await Promise.all([
        this.prisma.feedback.count({ where: { ...where, rating: 1 } }),
        this.prisma.feedback.count({ where: { ...where, rating: 2 } }),
        this.prisma.feedback.count({ where: { ...where, rating: 3 } }),
        this.prisma.feedback.count({ where: { ...where, rating: 4 } }),
        this.prisma.feedback.count({ where: { ...where, rating: 5 } }),
        this.prisma.feedback.aggregate({
          where,
          _sum: {
            rating: true,
          },
        }),
      ]);

      const averageRating = sumRating._sum.rating / totalFeedbacks;

      return {
        totalFeedbacks,
        averageRating,
        oneStar,
        twoStars,
        threeStars,
        fourStars,
        fiveStars,
      };
    } catch (error) {
      this.logger.error(`Error getting feedback summary: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get product feedback
   */
  async getProductFeedback(productId: string, searchInput: SearchFeedbackInput) {
    try {
      searchInput.productId = productId;
      searchInput.type = FeedbackType.PRODUCT;
      searchInput.status = FeedbackStatus.APPROVED;
      return this.getAllFeedback(searchInput);
    } catch (error) {
      this.logger.error(`Error getting product feedback: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get seller feedback
   */
  async getSellerFeedback(sellerId: string, searchInput: SearchFeedbackInput) {
    try {
      searchInput.sellerId = sellerId;
      searchInput.type = FeedbackType.SELLER;
      searchInput.status = FeedbackStatus.APPROVED;
      return this.getAllFeedback(searchInput);
    } catch (error) {
      this.logger.error(`Error getting seller feedback: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if user has already submitted feedback for an entity
   */
  async hasUserSubmittedFeedback(userId: string, type: FeedbackType, entityId: string) {
    try {
      const where: any = {
        userId,
        type,
      };

      // Set the appropriate filter based on the type
      switch (type) {
        case FeedbackType.PRODUCT:
          where.productId = entityId;
          break;
        case FeedbackType.SELLER:
          where.sellerId = entityId;
          break;
        case FeedbackType.ORDER:
          where.orderId = entityId;
          break;
        default:
          where.type = type;
      }

      const count = await this.prisma.feedback.count({ where });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking if user submitted feedback: ${error.message}`, error.stack);
      throw error;
    }
  }
}
