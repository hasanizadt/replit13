import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

@InputType()
export class SearchReviewInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid user ID format' })
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid product ID format' })
  productId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid seller ID format' })
  sellerId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isVerified?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isPublished?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;
}