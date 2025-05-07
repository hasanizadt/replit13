import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, IsIn, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderByInput } from '../../common/dto/order-by.input';
import { SortDirection } from '../../common/enums/sort-direction.enum';
import { SortField } from '../../common/enums/sort-field.enum';

@InputType()
export class SearchFlashInput {
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

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'Active flag must be a boolean' })
  @Type(() => Boolean)
  active?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @IsIn(['title', 'startDate', 'endDate', 'createdAt', 'updatedAt'], { 
    message: 'Sort field must be one of: title, startDate, endDate, createdAt, updatedAt' 
  })
  sortBy?: string = 'createdAt';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Sort direction must be a string' })
  @IsIn(['asc', 'desc'], { message: 'Sort direction must be one of: asc, desc' })
  sortDirection?: 'asc' | 'desc' = 'desc';
  
  @Field(() => OrderByInput, { nullable: true })
  @IsOptional()
  orderBy?: OrderByInput;
}