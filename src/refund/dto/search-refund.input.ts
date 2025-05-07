import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { RefundStatus } from '../enums/refund-status.enum';

@InputType()
export class SearchRefundInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  productId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  refundableId?: string;

  @Field(() => RefundStatus, { nullable: true })
  @IsOptional()
  @IsEnum(RefundStatus)
  status?: RefundStatus;

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

  @Field(() => String, { nullable: true, defaultValue: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field(() => String, { nullable: true, defaultValue: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}