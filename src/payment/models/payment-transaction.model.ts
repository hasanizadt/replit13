import { Field, Float, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { Order } from '../../order/models/order.model';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { PaymentTransactionStatus } from '../enums/payment-transaction-status.enum';

@ObjectType()
export class PaymentTransaction {
  @Field(() => String)
  id: string;

  @Field(() => String)
  orderId: string;

  @Field(() => String)
  userId: string;

  @Field(() => Float)
  amount: number;

  @Field(() => PaymentProvider)
  provider: PaymentProvider;

  @Field(() => PaymentTransactionStatus)
  status: PaymentTransactionStatus;

  @Field(() => String, { nullable: true })
  transactionId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => User)
  user: User;

  @Field(() => Order)
  order: Order;
}