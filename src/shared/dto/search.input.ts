import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { OrderByInput, OrderDirection } from '../../common/dto/order-by.input';
import { SortDirection } from '../../common/enums/sort-direction.enum';
import { SortField } from '../../common/enums/sort-field.enum';

// Re-export these enums for use in other modules
export { SortDirection } from '../../common/enums/sort-direction.enum';
export { SortField } from '../../common/enums/sort-field.enum';

@InputType()
export class SearchInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => SortField, { nullable: true, defaultValue: SortField.CREATED_AT })
  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField = SortField.CREATED_AT;

  @Field(() => SortDirection, { nullable: true, defaultValue: SortDirection.DESC })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;
  
  // New field for proper GraphQL typing
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
}