import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class SearchWishlistInput {
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
  @IsString({ message: 'Search query must be a string' })
  search?: string;
}