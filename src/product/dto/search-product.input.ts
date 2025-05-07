import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { OrderByInput } from '../../common/dto/order-by.input';
import { SortDirection } from '../../common/enums/sort-direction.enum';
import { SortField } from '../../common/enums/sort-field.enum';

export enum SortBy {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  PRICE_LOW_TO_HIGH = 'PRICE_LOW_TO_HIGH',
  PRICE_HIGH_TO_LOW = 'PRICE_HIGH_TO_LOW',
  POPULARITY = 'POPULARITY',
  RATING = 'RATING',
}

@InputType()
export class SearchProductInput {
  // Common fields from SearchInput
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => SortField, { nullable: true, defaultValue: SortField.CREATED_AT })
  @IsOptional()
  @IsEnum(SortField)
  standardSortBy?: SortField = SortField.CREATED_AT;

  @Field(() => SortDirection, { nullable: true, defaultValue: SortDirection.DESC })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;
  
  @Field(() => OrderByInput, { nullable: true })
  @IsOptional()
  orderBy?: OrderByInput;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;
  
  // Product-specific fields
  @Field(() => String, { nullable: true, description: 'For backward compatibility' })
  @IsUUID()
  @IsOptional()
  mainCategoryId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @Field(() => [String], { nullable: true, description: 'For backward compatibility' })
  @IsArray()
  @IsOptional()
  subCategoryIds?: string[];

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  brandId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  shopId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  sellerId?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxPrice?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  hasDiscount?: boolean;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minRating?: number;

  @Field(() => String, { nullable: true })
  @IsEnum(SortBy)
  @IsOptional()
  productSortBy?: SortBy;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  flashId?: string;
}