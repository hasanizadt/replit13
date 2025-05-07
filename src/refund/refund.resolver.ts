import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RefundService } from './refund.service';
import { Refund } from './models/refund.model';
import { Refundable } from './models/refundable.model';
import { GetRefunds } from './models/get-refunds.model';
import { GetRefundables } from './models/get-refundables.model';
import { CreateRefundableInput } from './dto/create-refundable.input';
import { CreateRefundInput } from './dto/create-refund.input';
import { UpdateRefundStatusInput } from './dto/update-refund-status.input';
import { SearchRefundInput } from './dto/search-refund.input';
import { SearchRefundableInput } from './dto/search-refundable.input';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Refund)
export class RefundResolver {
  constructor(private readonly refundService: RefundService) {}

  /**
   * Create a new refundable item (Admin only)
   */
  @Mutation(() => Refundable)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createRefundable(
    @Args('createRefundableInput') createRefundableInput: CreateRefundableInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.refundService.createRefundable(userId, createRefundableInput);
  }

  /**
   * Get all refundable items with pagination and filtering (Admin only)
   */
  @Query(() => GetRefundables)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRefundables(@Args('searchInput') searchInput: SearchRefundableInput) {
    return this.refundService.findAllRefundables(searchInput);
  }

  /**
   * Get my refundable items with pagination and filtering (User only)
   */
  @Query(() => GetRefundables)
  @UseGuards(AuthGuard)
  async getMyRefundables(
    @Args('searchInput') searchInput: SearchRefundableInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.refundService.findRefundablesByUserId(userId, searchInput);
  }

  /**
   * Get a refundable item by ID (Admin and User - own refundable items)
   */
  @Query(() => Refundable)
  @UseGuards(AuthGuard)
  async getRefundableById(@Args('id') id: string, @Context() context) {
    const { user } = context.req;
    const refundable = await this.refundService.findRefundableById(id);

    // Check if the user has permission to view this refundable item
    if (user.role === 'ADMIN') {
      return refundable;
    } else if (refundable.userId === user.id) {
      return refundable;
    }

    throw new Error('You do not have permission to view this refundable item');
  }

  /**
   * Create a new refund request (User only)
   */
  @Mutation(() => Refund)
  @UseGuards(AuthGuard)
  async createRefund(
    @Args('createRefundInput') createRefundInput: CreateRefundInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.refundService.createRefund(userId, createRefundInput);
  }

  /**
   * Get all refund requests with pagination and filtering (Admin only)
   */
  @Query(() => GetRefunds)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRefunds(@Args('searchInput') searchInput: SearchRefundInput) {
    return this.refundService.findAllRefunds(searchInput);
  }

  /**
   * Get my refund requests with pagination and filtering (User only)
   */
  @Query(() => GetRefunds)
  @UseGuards(AuthGuard)
  async getMyRefunds(
    @Args('searchInput') searchInput: SearchRefundInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.refundService.findRefundsByUserId(userId, searchInput);
  }

  /**
   * Get a refund request by ID (Admin and User - own refund requests)
   */
  @Query(() => Refund)
  @UseGuards(AuthGuard)
  async getRefundById(@Args('id') id: string, @Context() context) {
    const { user } = context.req;
    const refund = await this.refundService.findRefundById(id);

    // Check if the user has permission to view this refund request
    if (user.role === 'ADMIN') {
      return refund;
    } else if (refund.userId === user.id) {
      return refund;
    }

    throw new Error('You do not have permission to view this refund request');
  }

  /**
   * Update a refund request's status (Admin only)
   */
  @Mutation(() => Refund)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateRefundStatus(
    @Args('updateRefundStatusInput') updateRefundStatusInput: UpdateRefundStatusInput,
  ) {
    return this.refundService.updateRefundStatus(updateRefundStatusInput);
  }
}