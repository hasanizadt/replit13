import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum WebhookEvent {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  CUSTOMER_CREATED = 'CUSTOMER_CREATED',
  CUSTOMER_UPDATED = 'CUSTOMER_UPDATED',
  INVENTORY_LOW = 'INVENTORY_LOW',
  INVENTORY_UPDATED = 'INVENTORY_UPDATED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
}

registerEnumType(WebhookEvent, {
  name: 'WebhookEvent',
  description: 'Events that can trigger webhooks',
});

@ObjectType()
export class Webhook {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  url: string;

  @Field(() => [String])
  events: string[];

  @Field(() => String, { description: 'Secret key for signature verification (masked)' })
  secretKey: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Int)
  failureCount: number;

  @Field(() => Date, { nullable: true })
  lastCalledAt?: Date;

  @Field(() => Date, { nullable: true })
  lastFailedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class WebhookPagination {
  @Field(() => [Webhook])
  webhooks: Webhook[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  pageCount: number;
}

@ObjectType()
export class WebhookWithSecret {
  @Field(() => Webhook)
  webhook: Webhook;

  @Field(() => String, { description: 'Secret key, only shown once' })
  secretKey: string;
}

@ObjectType()
export class WebhookLog {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  webhookId: string;

  @Field(() => String)
  event: string;

  @Field(() => String)
  payload: string;

  @Field(() => Int, { nullable: true })
  statusCode?: number;

  @Field(() => String, { nullable: true })
  response?: string;

  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Int, { nullable: true })
  executionMs?: number;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType()
export class WebhookLogPagination {
  @Field(() => [WebhookLog])
  logs: WebhookLog[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  pageCount: number;
}
