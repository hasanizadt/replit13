import { Field, InputType, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class VerifyCouponInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Coupon code is required' })
  @IsString({ message: 'Coupon code must be a string' })
  code: string;

  @Field(() => Float)
  @IsNotEmpty({ message: 'Cart total is required' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Cart total must be a number with at most 2 decimal places' })
  @Min(0, { message: 'Cart total must be at least 0' })
  @Type(() => Number)
  cartTotal: number;
}