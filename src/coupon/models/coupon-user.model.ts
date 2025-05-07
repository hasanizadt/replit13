import { Field, ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { Coupon } from './coupon.model';
import { DiscountUnit } from './discount-unit.enum';

@ObjectType()
export class CouponUser {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  code: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  couponId: string;
  
  @Field(() => Float)
  discount: number;

  @Field(() => DiscountUnit)
  discountUnit: DiscountUnit;
  
  @Field(() => Int)
  points: number;

  @Field(() => Date, { nullable: true })
  usedAt?: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => Coupon, { nullable: true })
  coupon?: Coupon;
}

@ObjectType()
export class CouponUserMeta {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  itemCount: number;

  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}

@ObjectType()
export class CouponUserPaginatedResponse {
  @Field(() => [CouponUser])
  results: CouponUser[];

  @Field(() => CouponUserMeta)
  meta: CouponUserMeta;
}
