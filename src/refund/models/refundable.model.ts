import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { Product } from '../../product/models/product.model';
import { Order } from '../../order/models/order.model';
import { Seller } from '../../seller/models/seller.model';
import { Address } from '../../user/models/address.model';
import { Refund } from './refund.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Refundable {
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  productId: string;

  @Field(() => String)
  orderId: string;

  @Field(() => String)
  sellerId: string;

  @Field(() => String)
  addressId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => GraphQLJSON, { nullable: true })
  variation?: any; // [ { name: string, variant: string } ]

  @Field(() => Float)
  couponDiscount: number;

  @Field(() => Float)
  amount: number;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Product, { nullable: true })
  product?: Product;

  @Field(() => Order, { nullable: true })
  order?: Order;

  @Field(() => Seller, { nullable: true })
  seller?: Seller;

  @Field(() => Address, { nullable: true })
  address?: Address;

  @Field(() => [Refund], { nullable: true })
  refunds?: Refund[];
}