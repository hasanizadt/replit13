import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min, Max, IsEnum, IsDate, IsBoolean } from 'class-validator';
import { PointTransactionType } from '../models/point.model';
import { SortDirection } from '../../common/enums/sort-direction.enum';
import { OrderByInput } from '../../common/dto/order-by.input';

@InputType()
export class SearchPointTransactionInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  orderId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(PointTransactionType)
  type?: PointTransactionType;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @Field(() => String, { defaultValue: 'createdAt' })
  @IsString()
  sortBy: string = 'createdAt';

  @Field(() => SortDirection, { defaultValue: SortDirection.DESC })
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.DESC;
  
  @Field(() => OrderByInput, { nullable: true })
  @IsOptional()
  orderBy?: OrderByInput;
}
