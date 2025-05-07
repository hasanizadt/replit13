import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

/**
 * Sales summary by time period
 */
@ObjectType()
export class SalesSummary {
  @Field(() => String)
  period: string;

  @Field(() => Float)
  revenue: number;

  @Field(() => Int)
  orderCount: number;

  @Field(() => Float)
  averageOrderValue: number;
}

/**
 * Product performance analytics
 */
@ObjectType()
export class ProductAnalytics {
  @Field(() => String)
  productId: string;

  @Field(() => String)
  productName: string;

  @Field(() => Int)
  unitsSold: number;

  @Field(() => Float)
  revenue: number;

  @Field(() => Float, { nullable: true })
  conversionRate?: number;

  @Field(() => Int, { nullable: true })
  views?: number;
}

/**
 * Category performance analytics
 */
@ObjectType()
export class CategoryAnalytics {
  @Field(() => String)
  categoryId: string;

  @Field(() => String)
  categoryName: string;

  @Field(() => Int)
  totalProducts: number;

  @Field(() => Int)
  unitsSold: number;

  @Field(() => Float)
  revenue: number;
}

/**
 * Customer analytics
 */
@ObjectType()
export class CustomerAnalytics {
  @Field(() => Float)
  totalCustomers: number;

  @Field(() => Float)
  activeCustomers: number;

  @Field(() => Float)
  newCustomers: number;

  @Field(() => Float, { nullable: true })
  customerRetentionRate?: number;

  @Field(() => Float)
  averageLifetimeValue: number;
}

/**
 * Order status distribution
 */
@ObjectType()
export class OrderStatusAnalytics {
  @Field(() => String)
  status: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}

/**
 * Sales by payment method
 */
@ObjectType()
export class PaymentMethodAnalytics {
  @Field(() => String)
  method: string;

  @Field(() => Float)
  revenue: number;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}

/**
 * Dashboard summary analytics
 */
@ObjectType()
export class DashboardAnalytics {
  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  averageOrderValue: number;

  @Field(() => Int)
  totalCustomers: number;

  @Field(() => Int)
  totalProducts: number;

  @Field(() => Float, { nullable: true })
  conversionRate?: number;

  @Field(() => [SalesSummary])
  salesByPeriod: SalesSummary[];

  @Field(() => [ProductAnalytics])
  topProducts: ProductAnalytics[];

  @Field(() => [CategoryAnalytics])
  topCategories: CategoryAnalytics[];

  @Field(() => [OrderStatusAnalytics])
  orderStatusDistribution: OrderStatusAnalytics[];

  @Field(() => [PaymentMethodAnalytics])
  salesByPaymentMethod: PaymentMethodAnalytics[];
}
