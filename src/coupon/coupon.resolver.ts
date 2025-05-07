import { Resolver, Args, Mutation, Query, Context } from '@nestjs/graphql';
import { CouponService } from './coupon.service';
import { CreateCouponInput } from './dto/create-coupon.input';
import { UpdateCouponInput } from './dto/update-coupon.input';
import { SearchCouponInput } from './dto/search-coupon.input';
import { VerifyCouponInput } from './dto/verify-coupon.input';
import { CreateCouponUserInput } from './dto/create-coupon-user.input';
import { SearchCouponUserInput } from './dto/search-coupon-user.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Coupon, CouponPaginatedResponse, GenericResponse } from './models/coupon.model';
import { CouponUser, CouponUserPaginatedResponse } from './models/coupon-user.model';
import { UsedCoupon } from './models/used-coupon.model';
import { CouponVerificationResult, VerifyCouponResponse } from './models/coupon-response.model';

@Resolver(() => Coupon)
export class CouponResolver {
  constructor(private readonly couponService: CouponService) {}

  /**
   * Create a new coupon (Admin only)
   */
  @Mutation(() => Coupon)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createCoupon(
    @Args('createCouponInput') createCouponInput: CreateCouponInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.couponService.createCoupon(userId, createCouponInput);
  }

  /**
   * Get all coupons with pagination and filtering (Admin only)
   */
  @Query(() => CouponPaginatedResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getCoupons(@Args('searchInput') searchInput: SearchCouponInput) {
    return this.couponService.findAllCoupons(searchInput);
  }

  /**
   * Get a coupon by ID (Admin only)
   */
  @Query(() => Coupon)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getCouponById(@Args('id') id: string) {
    return this.couponService.findCouponById(id);
  }

  /**
   * Update a coupon (Admin only)
   */
  @Mutation(() => Coupon)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateCoupon(
    @Args('updateCouponInput') updateCouponInput: UpdateCouponInput,
  ) {
    return this.couponService.updateCoupon(updateCouponInput);
  }

  /**
   * Delete a coupon (Admin only)
   */
  @Mutation(() => GenericResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteCoupon(@Args('id') id: string) {
    return this.couponService.deleteCoupon(id);
  }

  /**
   * Verify a coupon (User only)
   */
  @Query(() => CouponVerificationResult)
  @UseGuards(AuthGuard)
  async verifyCoupon(
    @Args('verifyCouponInput') verifyCouponInput: VerifyCouponInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.couponService.verifyCoupon(userId, verifyCouponInput);
  }

  /**
   * Create a coupon for a user (Admin only)
   */
  @Mutation(() => CouponUser)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createCouponForUser(
    @Args('createCouponUserInput') createCouponUserInput: CreateCouponUserInput,
  ) {
    return this.couponService.createCouponUser(createCouponUserInput);
  }

  /**
   * Get all coupons for a user (Admin only)
   */
  @Query(() => CouponUserPaginatedResponse)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getUserCoupons(@Args('searchInput') searchInput: SearchCouponUserInput) {
    return this.couponService.findAllCouponUsers(searchInput);
  }

  /**
   * Get my coupons (User only)
   */
  @Query(() => CouponUserPaginatedResponse)
  @UseGuards(AuthGuard)
  async getMyCoupons(
    @Args('searchInput') searchInput: SearchCouponUserInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.couponService.findAllCouponUsers({
      ...searchInput,
      userId,
    });
  }
}
