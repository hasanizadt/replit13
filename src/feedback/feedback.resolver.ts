import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { FeedbackService } from './feedback.service';
import { 
  Feedback, 
  FeedbackPagination, 
  FeedbackSummary, 
  FeedbackType, 
  FeedbackStatus 
} from './models/feedback.model';
import { 
  CreateFeedbackInput, 
  UpdateFeedbackInput, 
  UpdateFeedbackStatusInput, 
  SearchFeedbackInput 
} from './dto/feedback.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Feedback)
export class FeedbackResolver {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Create a new feedback (User only)
   */
  @Mutation(() => Feedback)
  @UseGuards(AuthGuard)
  async createFeedback(
    @Args('createFeedbackInput') createFeedbackInput: CreateFeedbackInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.feedbackService.createFeedback(userId, createFeedbackInput);
  }

  /**
   * Update a feedback (User only)
   */
  @Mutation(() => Feedback)
  @UseGuards(AuthGuard)
  async updateFeedback(
    @Args('updateFeedbackInput') updateFeedbackInput: UpdateFeedbackInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.feedbackService.updateFeedback(userId, updateFeedbackInput);
  }

  /**
   * Update feedback status (Admin only)
   */
  @Mutation(() => Feedback)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateFeedbackStatus(
    @Args('updateFeedbackStatusInput') updateFeedbackStatusInput: UpdateFeedbackStatusInput,
  ) {
    return this.feedbackService.updateFeedbackStatus(updateFeedbackStatusInput);
  }

  /**
   * Delete a feedback (User or Admin)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteFeedback(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    const isAdmin = context.req.user.role === 'ADMIN';
    return this.feedbackService.deleteFeedback(userId, id, isAdmin);
  }

  /**
   * Get all feedback with pagination and filtering (Admin only)
   */
  @Query(() => FeedbackPagination)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllFeedback(
    @Args('searchInput') searchInput: SearchFeedbackInput,
  ) {
    return this.feedbackService.getAllFeedback(searchInput);
  }

  /**
   * Get feedback by ID (Admin or owner)
   */
  @Query(() => Feedback)
  @UseGuards(AuthGuard)
  async getFeedbackById(
    @Args('id') id: string,
    @Context() context,
  ) {
    const feedback = await this.feedbackService.getFeedbackById(id);
    
    // Check if user is admin or the owner of the feedback
    const isAdmin = context.req.user.role === 'ADMIN';
    const isOwner = feedback.userId === context.req.user.id;
    
    if (!isAdmin && !isOwner) {
      throw new Error('You do not have permission to view this feedback');
    }
    
    return feedback;
  }

  /**
   * Get user's own feedback (User only)
   */
  @Query(() => FeedbackPagination)
  @UseGuards(AuthGuard)
  async getMyFeedback(
    @Args('searchInput') searchInput: SearchFeedbackInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.feedbackService.getUserFeedback(userId, searchInput);
  }

  /**
   * Get feedback summary for a product (Public)
   */
  @Query(() => FeedbackSummary)
  async getProductFeedbackSummary(
    @Args('productId') productId: string,
  ) {
    return this.feedbackService.getFeedbackSummary(FeedbackType.PRODUCT, productId);
  }

  /**
   * Get product feedback with pagination (Public)
   */
  @Query(() => FeedbackPagination)
  async getProductFeedback(
    @Args('productId') productId: string,
    @Args('searchInput') searchInput: SearchFeedbackInput,
  ) {
    return this.feedbackService.getProductFeedback(productId, searchInput);
  }

  /**
   * Get feedback summary for a seller (Public)
   */
  @Query(() => FeedbackSummary)
  async getSellerFeedbackSummary(
    @Args('sellerId') sellerId: string,
  ) {
    return this.feedbackService.getFeedbackSummary(FeedbackType.SELLER, sellerId);
  }

  /**
   * Get seller feedback with pagination (Public)
   */
  @Query(() => FeedbackPagination)
  async getSellerFeedback(
    @Args('sellerId') sellerId: string,
    @Args('searchInput') searchInput: SearchFeedbackInput,
  ) {
    return this.feedbackService.getSellerFeedback(sellerId, searchInput);
  }

  /**
   * Check if user has already submitted feedback for an entity (User only)
   */
  @Query(() => Boolean)
  @UseGuards(AuthGuard)
  async hasSubmittedFeedback(
    @Args('type', { type: () => FeedbackType }) type: FeedbackType,
    @Args('entityId') entityId: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.feedbackService.hasUserSubmittedFeedback(userId, type, entityId);
  }
}
