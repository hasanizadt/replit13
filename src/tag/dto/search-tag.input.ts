import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class SearchTagInput {
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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @IsIn(['name', 'createdAt', 'updatedAt'], { message: 'Sort field must be one of: name, createdAt, updatedAt' })
  sortBy?: string = 'createdAt';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Sort direction must be a string' })
  @IsIn(['asc', 'desc'], { message: 'Sort direction must be one of: asc, desc' })
  sortDirection?: 'asc' | 'desc' = 'desc';
}