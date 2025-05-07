import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RefundStatus } from '../enums/refund-status.enum';
import { User } from '../../user/models/user.model';
import { Product } from '../../product/models/product.model';
import { Refundable } from './refundable.model';

@ObjectType()
export class Refund {
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  refundableId: string;

  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  productId: string | null;

  @Field(() => Int)
  quantity: number;

  @Field(() => String)
  reason: string;

  @Field(() => String)
  description: string;

  @Field(() => RefundStatus)
  status: RefundStatus;

  @Field(() => Refundable, { nullable: true })
  refundable?: Refundable;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Product, { nullable: true })
  product?: Product;
}