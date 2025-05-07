import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Review } from './models/review.model';
import { GetReviews } from './models/review.model';
import { CreateReviewInput, UpdateReviewInput, SearchReviewInput } from './dto';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * Create a new review (User only)
   */
  @Mutation(() => Review)
  @UseGuards(AuthGuard)
  async createReview(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.reviewService.createReview(userId, createReviewInput);
  }

  /**
   * Get all reviews with pagination and filtering (Admin only)
   */
  @Query(() => GetReviews)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getReviews(@Args('searchInput') searchInput: SearchReviewInput) {
    return this.reviewService.findAllReviews(searchInput);
  }

  /**
   * Get my reviews with pagination and filtering (User only)
   */
  @Query(() => GetReviews)
  @UseGuards(AuthGuard)
  async getMyReviews(
    @Args('searchInput') searchInput: SearchReviewInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.reviewService.findReviewsByUserId(userId, searchInput);
  }

  /**
   * Get reviews by product ID with pagination and filtering (Public)
   */
  @Query(() => GetReviews)
  async getReviewsByProductId(
    @Args('productId') productId: string,
    @Args('searchInput') searchInput: SearchReviewInput,
  ) {
    return this.reviewService.findReviewsByProductId(productId, searchInput);
  }

  /**
   * Get reviews by seller ID with pagination and filtering (Public)
   */
  @Query(() => GetReviews)
  async getReviewsBySellerId(
    @Args('sellerId') sellerId: string,
    @Args('searchInput') searchInput: SearchReviewInput,
  ) {
    return this.reviewService.findReviewsBySellerId(sellerId, searchInput);
  }

  /**
   * Get a review by ID (Admin, User - own review)
   */
  @Query(() => Review)
  @UseGuards(AuthGuard)
  async getReviewById(@Args('id') id: string, @Context() context) {
    const { user } = context.req;
    const review = await this.reviewService.findReviewById(id);

    // Check if the user has permission to view this review
    if (user.role === 'ADMIN' || review.userId === user.id) {
      return review;
    }

    throw new Error('You do not have permission to view this review');
  }

  /**
   * Update a review (Admin, User - own review)
   */
  @Mutation(() => Review)
  @UseGuards(AuthGuard)
  async updateReview(
    @Args('updateReviewInput') updateReviewInput: UpdateReviewInput,
    @Context() context,
  ) {
    const { user } = context.req;
    const review = await this.reviewService.findReviewById(updateReviewInput.id);

    // Restrict verification and publishing status update to admin only
    if ((updateReviewInput.isVerified !== undefined || updateReviewInput.isPublished !== undefined) && user.role !== 'ADMIN') {
      throw new Error('Only admin can update verification and publishing status');
    }

    // Check if the user has permission to update this review
    if (user.role === 'ADMIN' || review.userId === user.id) {
      return this.reviewService.updateReview(updateReviewInput);
    }

    throw new Error('You do not have permission to update this review');
  }

  /**
   * Delete a review (Admin, User - own review)
   */
  @Mutation(() => Review)
  @UseGuards(AuthGuard)
  async deleteReview(@Args('id') id: string, @Context() context) {
    const { user } = context.req;
    const review = await this.reviewService.findReviewById(id);

    // Check if the user has permission to delete this review
    if (user.role === 'ADMIN' || review.userId === user.id) {
      return this.reviewService.deleteReview(id);
    }

    throw new Error('You do not have permission to delete this review');
  }
}