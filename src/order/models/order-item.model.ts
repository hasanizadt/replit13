import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Order } from './order.model';
import { Product } from '../../product/models/product.model';

@ObjectType()
export class OrderItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  orderId: string;

  @Field(() => String)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => Order)
  order: Order;

  @Field(() => Product)
  product: Product;
}