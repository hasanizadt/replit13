import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class SearchSellerInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be greater than or equal to 1' })
  @Max(100, { message: 'Limit must be less than or equal to 100' })
  limit?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Shop name must be a string' })
  shopName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid user ID format' })
  userId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isVerified must be a boolean' })
  isVerified?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isBanned must be a boolean' })
  isBanned?: boolean;

  @Field(() => String, { nullable: true, defaultValue: 'createdAt' })
  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string;

  @Field(() => String, { nullable: true, defaultValue: 'desc' })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc';
}