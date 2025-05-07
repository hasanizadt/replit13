import { Field, ObjectType, Float } from '@nestjs/graphql';
import { Coupon } from './coupon.model';

@ObjectType()
export class DeleteCouponResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class VerifyCouponResponse {
  @Field(() => Boolean)
  valid: boolean;

  @Field(() => Coupon, { nullable: true })
  coupon?: Coupon;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Float, { nullable: true })
  discount?: number;
}