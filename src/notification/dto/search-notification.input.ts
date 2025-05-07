
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, Min, IsBoolean } from 'class-validator';
import { NotificationType } from '@prisma/client';
import { OrderByInput } from '../../common/dto/order-by.input';
import { SortDirection } from '../../common/enums/sort-direction.enum';
import { SortField } from '../../common/enums/sort-field.enum';

@InputType()
export class SearchNotificationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  limit: number = 10;

  @Field(() => NotificationType, { nullable: true })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  read?: boolean;
  
  @Field(() => String, { nullable: true, defaultValue: 'createdAt' })
  @IsOptional()
  sortBy?: string = 'createdAt';
  
  @Field(() => SortDirection, { nullable: true, defaultValue: SortDirection.DESC })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.DESC;
  
  @Field(() => OrderByInput, { nullable: true })
  @IsOptional()
  orderBy?: OrderByInput;
}
