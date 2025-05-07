import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { Coupon } from './coupon.model';

@ObjectType()
export class UsedCoupon {
  @Field(() => String)
  id: string;

  @Field(() => String)
  couponId: string;

  @Field(() => String)
  userId: string;

  @Field(() => Boolean)
  used: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => Coupon, { nullable: true })
  coupon?: Coupon;

  @Field(() => User, { nullable: true })
  user?: User;
}