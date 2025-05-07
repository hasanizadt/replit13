import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PointsService } from './points.service';
import { PointTransaction, PointBalance, GetPointTransactions } from './models/point.model';
import { CreatePointTransactionInput } from './dto/create-point-transaction.input';
import { UpdatePointTransactionInput } from './dto/update-point-transaction.input';
import { SearchPointTransactionInput } from './dto/search-point-transaction.input';
import { RedeemPointsInput } from './dto/redeem-points.input';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => PointTransaction)
export class PointsResolver {
  constructor(private readonly pointsService: PointsService) {}

  /**
   * Create a new point transaction (Admin only)
   */
  @Mutation(() => PointTransaction)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async createPointTransaction(
    @Args('createPointTransactionInput') createPointTransactionInput: CreatePointTransactionInput,
  ) {
    return this.pointsService.createPointTransaction(createPointTransactionInput);
  }

  /**
   * Get all point transactions with pagination and filtering (Admin only)
   */
  @Query(() => GetPointTransactions)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async getPointTransactions(@Args('searchInput') searchInput: SearchPointTransactionInput) {
    return this.pointsService.findAllPointTransactions(searchInput);
  }

  /**
   * Get a point transaction by ID (Admin only)
   */
  @Query(() => PointTransaction)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async getPointTransactionById(@Args('id') id: string) {
    return this.pointsService.findPointTransactionById(id);
  }

  /**
   * Update a point transaction (Admin only)
   */
  @Mutation(() => PointTransaction)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updatePointTransaction(
    @Args('updatePointTransactionInput') updatePointTransactionInput: UpdatePointTransactionInput,
  ) {
    return this.pointsService.updatePointTransaction(updatePointTransactionInput);
  }

  /**
   * Delete a point transaction (Admin only)
   */
  @Mutation(() => PointTransaction)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async deletePointTransaction(@Args('id') id: string) {
    return this.pointsService.deletePointTransaction(id);
  }

  /**
   * Get user's point balance (User only)
   */
  @Query(() => PointBalance)
  @UseGuards(AuthGuard)
  @Roles('USER', 'ADMIN')
  async getMyPointBalance(@Context() context) {
    const { user } = context;
    return this.pointsService.getUserPointBalance(user.id);
  }

  /**
   * Get a user's point balance by user ID (Admin only)
   */
  @Query(() => PointBalance)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async getUserPointBalance(@Args('userId') userId: string) {
    return this.pointsService.getUserPointBalance(userId);
  }

  /**
   * Get a user's point transactions (User only)
   */
  @Query(() => GetPointTransactions)
  @UseGuards(AuthGuard)
  @Roles('USER', 'ADMIN')
  async getMyPointTransactions(
    @Args('searchInput') searchInput: SearchPointTransactionInput,
    @Context() context,
  ) {
    const { user } = context;
    return this.pointsService.findAllPointTransactions({
      ...searchInput,
      userId: user.id,
    });
  }

  /**
   * Redeem points (User only)
   */
  @Mutation(() => PointTransaction)
  @UseGuards(AuthGuard)
  @Roles('USER', 'ADMIN')
  async redeemPoints(
    @Args('redeemPointsInput') redeemPointsInput: RedeemPointsInput,
    @Context() context,
  ) {
    const { user } = context;
    return this.pointsService.redeemPoints(user.id, redeemPointsInput);
  }

  /**
   * Award points to a user (Admin only)
   */
  @Mutation(() => PointTransaction)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async awardPoints(
    @Args('userId') userId: string,
    @Args('points') points: number,
    @Args('orderId', { nullable: true }) orderId?: string,
    @Args('description', { nullable: true }) description?: string,
  ) {
    return this.pointsService.awardPoints(userId, points, orderId, description);
  }
}
