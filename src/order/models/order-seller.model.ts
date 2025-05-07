import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Order } from './order.model';
import { Seller } from '../../product/models/seller.model';
import { OrderStatus } from '../enums/order-status.enum';
import { CancelBy } from '../enums/cancel-by.enum';
import { OrderProduct } from './order-product.model';

@ObjectType()
export class OrderSeller {
  @Field(() => String)
  id: string;

  @Field(() => String)
  orderId: string;

  @Field(() => String)
  sellerId: string;

  @Field(() => String)
  shopName: string;

  @Field(() => Float)
  price: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => CancelBy, { nullable: true })
  cancelBy?: CancelBy;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => Order)
  order: Order;

  @Field(() => Seller)
  seller: Seller;

  @Field(() => [OrderProduct])
  products: OrderProduct[];
}