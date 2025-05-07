import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsUUID, IsDate } from 'class-validator';
import { OrderByInput } from '../../common/dto/order-by.input';

export enum StatusTrackingOrderBy {
  CREATED_AT_ASC = 'createdAt_ASC',
  CREATED_AT_DESC = 'createdAt_DESC',
  ENTITY_TYPE_ASC = 'entityType_ASC',
  ENTITY_TYPE_DESC = 'entityType_DESC',
}

// Register enum with GraphQL
registerEnumType(StatusTrackingOrderBy, {
  name: 'StatusTrackingOrderBy',
  description: 'Ordering options for status tracking records',
});

@InputType()
export class SearchStatusTrackingInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  entityType?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  entityId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fromStatus?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  toStatus?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  performedById?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  paymentId?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field(() => StatusTrackingOrderBy, { nullable: true, defaultValue: StatusTrackingOrderBy.CREATED_AT_DESC })
  @IsOptional()
  @IsEnum(StatusTrackingOrderBy)
  orderBy?: StatusTrackingOrderBy;
  
  // Add new field for OrderByInput to support advanced sorting
  @Field(() => OrderByInput, { nullable: true })
  @IsOptional()
  orderByInput?: OrderByInput;
}
