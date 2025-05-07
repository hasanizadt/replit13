import { Field, ObjectType } from '@nestjs/graphql';
import { PaymentTransaction } from './payment-transaction.model';
import { Meta } from '../../order/models/order.model';

@ObjectType()
export class GetPaymentTransactions {
  @Field(() => [PaymentTransaction], { nullable: true })
  results?: PaymentTransaction[];

  @Field(() => Meta, { nullable: true })
  meta?: Meta;
}