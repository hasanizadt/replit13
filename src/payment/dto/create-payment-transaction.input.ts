import { Field, Float, InputType } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { PaymentProvider } from '../enums/payment-provider.enum';

@InputType()
export class CreatePaymentTransactionInput {
  @Field(() => String)
  @IsString()
  orderId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => PaymentProvider)
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @Field(() => String, { nullable: true })
  @IsString()
  transactionId?: string;
}