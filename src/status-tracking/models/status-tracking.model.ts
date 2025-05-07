import { Field, ObjectType, ID, Int, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { PaginationMeta } from '../../shared/models/meta.model';

export enum EntityType {
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
  PAYMENT = 'PAYMENT',
  SHIPMENT = 'SHIPMENT',
  USER = 'USER',
  COUPON = 'COUPON',
  TICKET = 'TICKET',
}

registerEnumType(EntityType, {
  name: 'EntityType',
  description: 'The type of entity being tracked',
});

@ObjectType()
export class StatusTracking {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  entityType: string;

  @Field(() => String)
  entityId: string;

  @Field(() => String)
  fromStatus: string;

  @Field(() => String)
  toStatus: string;

  @Field(() => String, { nullable: true })
  comment?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field(() => String, { nullable: true })
  ipAddress?: string;

  @Field(() => String, { nullable: true })
  userAgent?: string;

  @Field(() => Date)
  performedAt: Date;

  @Field(() => String)
  performedById: string;

  @Field(() => String, { nullable: true })
  orderId?: string;

  @Field(() => String, { nullable: true })
  productId?: string;

  @Field(() => String, { nullable: true })
  paymentId?: string;
}

@ObjectType()
export class StatusTrackingPagination {
  @Field(() => [StatusTracking])
  items: StatusTracking[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  pageCount: number;
}

@ObjectType()
export class StatusTrackingPaginatedResponse {
  @Field(() => [StatusTracking])
  results: StatusTracking[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}