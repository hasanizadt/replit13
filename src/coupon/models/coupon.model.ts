import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { DiscountUnit } from './discount-unit.enum';
import { UsedCoupon } from './used-coupon.model';

@ObjectType()
export class Coupon {
  @Field(() => String)
  id: string;

  @Field(() => String)
  code: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Float)
  discount: number;

  @Field(() => DiscountUnit)
  discountUnit: DiscountUnit;

  @Field(() => Float, { nullable: true })
  minimumPurchase?: number;

  @Field(() => Float, { nullable: true })
  maximumDiscount?: number;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  expiresAt: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Int, { nullable: true })
  usageLimit?: number;

  @Field(() => Int)
  usageCount: number;

  @Field(() => String, { nullable: true })
  appliesTo?: string;

  @Field(() => String, { nullable: true })
  productId?: string;

  @Field(() => String, { nullable: true })
  categoryId?: string;

  @Field(() => String)
  createdBy: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [UsedCoupon], { nullable: true })
  usedCoupons?: UsedCoupon[];
}

@ObjectType()
export class CouponMeta {
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
export class CouponPaginatedResponse {
  @Field(() => [Coupon])
  results: Coupon[];

  @Field(() => CouponMeta)
  meta: CouponMeta;
}

@ObjectType()
export class GenericResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}
