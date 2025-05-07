import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum ReportType {
  SALES = 'SALES',
  REVENUE = 'REVENUE',
  CUSTOMERS = 'CUSTOMERS',
  PRODUCTS = 'PRODUCTS',
  INVENTORY = 'INVENTORY',
  SELLERS = 'SELLERS',
  SHIPPING = 'SHIPPING',
  TAXES = 'TAXES',
  PAYMENTS = 'PAYMENTS',
  RETURNS = 'RETURNS',
  CATEGORIES = 'CATEGORIES',
  CUSTOM = 'CUSTOM',
}

registerEnumType(ReportType, {
  name: 'ReportType',
  description: 'The type of report',
});

export enum ReportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  PDF = 'PDF',
  EXCEL = 'EXCEL',
}

registerEnumType(ReportFormat, {
  name: 'ReportFormat',
  description: 'The format of the report',
});

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(ReportStatus, {
  name: 'ReportStatus',
  description: 'The status of the report generation',
});

export enum TimePeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

registerEnumType(TimePeriod, {
  name: 'TimePeriod',
  description: 'The time period for the report',
});

@ObjectType()
export class ReportMetadata {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => ReportType)
  type: ReportType;

  @Field(() => ReportFormat)
  format: ReportFormat;

  @Field(() => ReportStatus)
  status: ReportStatus;

  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => String)
  createdBy: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  errorMessage?: string;

  @Field(() => TimePeriod)
  timePeriod: TimePeriod;

  @Field(() => Date, { nullable: true })
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  endDate?: Date;
}

@ObjectType()
export class SalesReportData {
  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  averageOrderValue: number;

  @Field(() => [SalesReportItem])
  items: SalesReportItem[];
}

@ObjectType()
export class SalesReportItem {
  @Field(() => String)
  date: string;

  @Field(() => Int)
  orders: number;

  @Field(() => Float)
  revenue: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  shipping: number;

  @Field(() => Float)
  refunds: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  netRevenue: number;
}

@ObjectType()
export class ProductReportData {
  @Field(() => Int)
  totalProducts: number;

  @Field(() => Int)
  totalSold: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => [ProductReportItem])
  items: ProductReportItem[];
}

@ObjectType()
export class ProductReportItem {
  @Field(() => String)
  productId: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  sku?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  sold: number;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  revenue: number;

  @Field(() => Float, { nullable: true })
  profit?: number;

  @Field(() => Float, { nullable: true })
  margin?: number;
}

@ObjectType()
export class CustomerReportData {
  @Field(() => Int)
  totalCustomers: number;

  @Field(() => Int)
  newCustomers: number;

  @Field(() => Float)
  totalSpent: number;

  @Field(() => Float)
  averageLifetimeValue: number;

  @Field(() => [CustomerReportItem])
  items: CustomerReportItem[];
}

@ObjectType()
export class CustomerReportItem {
  @Field(() => String)
  customerId: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;

  @Field(() => Date, { nullable: true })
  registrationDate?: Date;

  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  totalSpent: number;

  @Field(() => Date, { nullable: true })
  lastPurchaseDate?: Date;
}

@ObjectType()
export class CategoryReportData {
  @Field(() => Int)
  totalCategories: number;

  @Field(() => [CategoryReportItem])
  items: CategoryReportItem[];
}

@ObjectType()
export class CategoryReportItem {
  @Field(() => String)
  categoryId: string;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  productCount: number;

  @Field(() => Int)
  soldCount: number;

  @Field(() => Float)
  revenue: number;

  @Field(() => Float)
  percentageOfTotal: number;
}

@ObjectType()
export class ShippingReportData {
  @Field(() => Int)
  totalShipments: number;

  @Field(() => Float)
  totalShippingCost: number;

  @Field(() => Float)
  averageShippingCost: number;

  @Field(() => [ShippingReportItem])
  items: ShippingReportItem[];
}

@ObjectType()
export class ShippingReportItem {
  @Field(() => String)
  method: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  cost: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class TaxReportData {
  @Field(() => Float)
  totalTaxCollected: number;

  @Field(() => [TaxReportItem])
  items: TaxReportItem[];
}

@ObjectType()
export class TaxReportItem {
  @Field(() => String)
  region: string;

  @Field(() => Float)
  taxRate: number;

  @Field(() => Float)
  taxableAmount: number;

  @Field(() => Float)
  taxCollected: number;
}

@ObjectType()
export class InventoryReportData {
  @Field(() => Int)
  totalProducts: number;

  @Field(() => Int)
  lowStockProducts: number;

  @Field(() => Int)
  outOfStockProducts: number;

  @Field(() => [InventoryReportItem])
  items: InventoryReportItem[];
}

@ObjectType()
export class InventoryReportItem {
  @Field(() => String)
  productId: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  sku?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  sold: number;

  @Field(() => Float)
  stockValue: number;

  @Field(() => String, { nullable: true })
  status?: string;
}

@ObjectType()
export class PaymentReportData {
  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  totalTransactions: number;

  @Field(() => [PaymentReportItem])
  items: PaymentReportItem[];
}

@ObjectType()
export class PaymentReportItem {
  @Field(() => String)
  method: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  percentage: number;

  @Field(() => Float, { nullable: true })
  fees?: number;
}

@ObjectType()
export class ReturnsReportData {
  @Field(() => Int)
  totalReturns: number;

  @Field(() => Float)
  totalRefundAmount: number;

  @Field(() => Float)
  returnRate: number;

  @Field(() => [ReturnsReportItem])
  items: ReturnsReportItem[];
}

@ObjectType()
export class ReturnsReportItem {
  @Field(() => String)
  reason: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class SellerReportData {
  @Field(() => Int)
  totalSellers: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => [SellerReportItem])
  items: SellerReportItem[];
}

@ObjectType()
export class SellerReportItem {
  @Field(() => String)
  sellerId: string;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  productCount: number;

  @Field(() => Int)
  orderCount: number;

  @Field(() => Float)
  revenue: number;

  @Field(() => Float)
  commission: number;

  @Field(() => Float)
  netEarnings: number;
}
