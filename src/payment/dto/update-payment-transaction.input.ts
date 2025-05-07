import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsString } from 'class-validator';
import { PaymentTransactionStatus } from '../enums/payment-transaction-status.enum';

@InputType()
export class UpdatePaymentTransactionInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => PaymentTransactionStatus)
  @IsEnum(PaymentTransactionStatus)
  status: PaymentTransactionStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  transactionId?: string;
}