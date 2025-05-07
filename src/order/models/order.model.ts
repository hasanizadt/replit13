import { Field, Float, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderSeller } from './order-seller.model';
import { OrderItem } from './order-item.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Order {
  @Field(() => String)
  id: string;

  @Field(() => Boolean)
  isPaid: boolean;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  trackingNumber?: string;

  @Field(() => Float)
  subTotal: number;

  @Field(() => String)
  userId: string;

  @Field(() => Float)
  total: number;

  @Field(() => Float)
  couponDiscount: number;

  @Field(() => String, { nullable: true })
  estimateDelivery?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  payment?: any; // { paymentMethod: string, paymentId: string, provider: string }

  @Field(() => String, { nullable: true })
  note?: string;

  @Field(() => String)
  paymentStatus: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => String, { nullable: true })
  shippingAddressId?: string;

  @Field(() => String, { nullable: true })
  billingAddressId?: string;

  @Field(() => Number)
  shippingCount: number;

  @Field(() => Float)
  shippingFees: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => User)
  user: User;

  @Field(() => [OrderSeller], { nullable: true })
  orderSellers?: OrderSeller[];

  @Field(() => [OrderItem], { nullable: true })
  orderItems?: OrderItem[];
}

@ObjectType('OrderMeta')
export class Meta {
  @Field(() => Number, { nullable: true })
  itemCount?: number;

  @Field(() => Number, { nullable: true })
  totalItems?: number;

  @Field(() => Number, { nullable: true })
  itemsPerPage?: number;

  @Field(() => Number, { nullable: true })
  totalPages?: number;

  @Field(() => Number, { nullable: true })
  currentPage?: number;
}

@ObjectType()
export class GetOrders {
  @Field(() => [Order], { nullable: true })
  results?: Order[];

  @Field(() => Meta, { nullable: true })
  meta?: Meta;
}