import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, IsString, IsBoolean, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class SearchCouponUserInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit?: number = 10;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'User ID must be a string' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  search?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'Used flag must be a boolean' })
  @Type(() => Boolean)
  used?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @IsIn(['code', 'discount', 'points', 'createdAt', 'usedAt'], { 
    message: 'Sort field must be one of: code, discount, points, createdAt, usedAt' 
  })
  sortBy?: string = 'createdAt';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Sort direction must be a string' })
  @IsIn(['asc', 'desc'], { message: 'Sort direction must be one of: asc, desc' })
  sortDirection?: 'asc' | 'desc' = 'desc';
}