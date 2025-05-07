import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { PaymentTransactionStatus } from '../enums/payment-transaction-status.enum';

@InputType()
export class SearchPaymentTransactionInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  orderId?: string;

  @Field(() => PaymentProvider, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @Field(() => PaymentTransactionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentTransactionStatus)
  status?: PaymentTransactionStatus;

  @Field(() => Number, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Number, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @Field(() => String, { nullable: true, defaultValue: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field(() => String, { nullable: true, defaultValue: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}