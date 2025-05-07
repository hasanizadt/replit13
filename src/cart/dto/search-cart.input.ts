import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

@InputType()
export class SearchCartInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  limit: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid product ID format' })
  productId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid seller ID format' })
  sellerId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;
}