import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateRefundableInput {
  @Field(() => String)
  @IsString()
  productId: string;

  @Field(() => String)
  @IsString()
  orderId: string;

  @Field(() => String)
  @IsString()
  sellerId: string;

  @Field(() => String)
  @IsString()
  addressId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;

  @Field(() => GraphQLJSON, { nullable: true })
  variation?: any; // [ { name: string, variant: string } ]

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  couponDiscount: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;
}