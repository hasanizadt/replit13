import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, Min } from 'class-validator';

@InputType()
export class CreateRefundInput {
  @Field(() => String)
  @IsString()
  refundableId: string;

  @Field(() => String)
  @IsString()
  productId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;

  @Field(() => String)
  @IsString()
  reason: string;

  @Field(() => String)
  @IsString()
  description: string;
}