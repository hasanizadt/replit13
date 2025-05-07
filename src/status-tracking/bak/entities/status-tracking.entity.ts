import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

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
export class StatusTrackingPaginatedResponse {
  @Field(() => [StatusTracking])
  results: StatusTracking[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

// Using PaginationMeta from shared module instead of local definition
import { PaginationMeta } from '../../../shared/models/meta.model';
export { PaginationMeta };
