import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';
import { SortDirection } from '../../common/enums/sort-direction.enum';
import { SortField } from '../../common/enums/sort-field.enum';
import { OrderByInput } from '../../common/dto/order-by.input';

// Define specific order sort fields that extend the common SortField
export enum OrderSortField {
  ORDER_DATE = 'orderDate',
  TOTAL_AMOUNT = 'totalAmount',
  PAYMENT_STATUS = 'paymentStatus',
}

// Register the extended enum
registerEnumType(OrderSortField, {
  name: 'OrderSortField',
  description: 'Fields that can be used for sorting orders',
});

// Input type that combines both common and order-specific sort fields
type CombinedSortField = SortField | OrderSortField;

@InputType()
export class SearchOrderInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  paymentStatus?: boolean;

  @Field(() => Number, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Number, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  // New field for proper GraphQL typing
  @Field(() => OrderByInput, { nullable: true })
  @IsOptional()
  orderBy?: OrderByInput;

  // Updated to use the combined sort fields
  @Field(() => String, { nullable: true, description: 'Legacy field. Use SortField/OrderSortField types instead.', deprecationReason: 'Use orderBy instead' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  // Updated to use the SortDirection enum
  @Field(() => SortDirection, { nullable: true, defaultValue: SortDirection.DESC, deprecationReason: 'Use orderBy instead' })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;

  // Keeping for backward compatibility
  @Field(() => String, { nullable: true, defaultValue: 'desc', deprecationReason: 'Use orderBy instead' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}