import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { AnalyticsService } from './analytics.service';
import { 
  DashboardAnalytics,
  ProductAnalytics,
  CategoryAnalytics,
  CustomerAnalytics
} from './models/analytics.model';
import { AnalyticsQueryInput } from './dto/analytics-query.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get dashboard analytics (Admin only)
   */
  @Query(() => DashboardAnalytics)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getDashboardAnalytics(
    @Args('query') query: AnalyticsQueryInput,
  ) {
    return this.analyticsService.getDashboardAnalytics(query);
  }

  /**
   * Get product analytics (Admin only)
   */
  @Query(() => ProductAnalytics)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getProductAnalytics(
    @Args('productId') productId: string,
    @Args('query') query: AnalyticsQueryInput,
  ) {
    return this.analyticsService.getProductAnalytics(productId, query);
  }

  /**
   * Get category analytics (Admin only)
   */
  @Query(() => CategoryAnalytics)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getCategoryAnalytics(
    @Args('categoryId') categoryId: string,
    @Args('query') query: AnalyticsQueryInput,
  ) {
    return this.analyticsService.getCategoryAnalytics(categoryId, query);
  }

  /**
   * Get customer analytics (Admin only)
   */
  @Query(() => CustomerAnalytics)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getCustomerAnalytics(
    @Args('query') query: AnalyticsQueryInput,
  ) {
    return this.analyticsService.getCustomerAnalytics(query);
  }
}
