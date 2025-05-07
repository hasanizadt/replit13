import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { OrderSeller } from './order-seller.model';
import { Product } from '../../product/models/product.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class OrderProduct {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  orderSellerId?: string;

  @Field(() => String)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: any; // [ { id: string, name: string, variant: string } ]

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  amount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => OrderSeller, { nullable: true })
  orderSeller?: OrderSeller;

  @Field(() => Product)
  product: Product;
}