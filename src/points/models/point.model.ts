import { Field, ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { Order } from '../../order/models/order.model';

export enum PointTransactionType {
  EARNED = 'EARNED',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
  ADJUSTED = 'ADJUSTED',
}

@ObjectType()
export class PointTransaction {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  orderId?: string;

  @Field(() => Order, { nullable: true })
  order?: Order;

  @Field(() => Int)
  points: number;

  @Field(() => Float, { nullable: true })
  monetaryValue?: number;

  @Field(() => String)
  type: PointTransactionType;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Date, { nullable: true })
  expiresAt?: Date;

  @Field(() => Boolean)
  active: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class PointBalance {
  @Field(() => Int)
  totalPoints: number;

  @Field(() => Int)
  availablePoints: number;

  @Field(() => Int)
  pendingPoints: number;

  @Field(() => Int)
  expiredPoints: number;

  @Field(() => Int)
  redeemedPoints: number;

  @Field(() => Float)
  monetaryValue: number;
}

@ObjectType()
export class GetPointTransactions {
  @Field(() => [PointTransaction])
  transactions: PointTransaction[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  page: number;

  @Field(() => Number)
  pageSize: number;

  @Field(() => Number)
  pageCount: number;
}
