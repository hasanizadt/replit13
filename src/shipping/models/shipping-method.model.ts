import { Field, ObjectType, ID, Float } from '@nestjs/graphql';
import { ShippingZone } from './shipping-zone.model';

@ObjectType()
export class ShippingMethod {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  shippingZoneId: string;

  @Field(() => ShippingZone, { nullable: true })
  shippingZone?: ShippingZone;

  @Field(() => Float)
  price: number;

  @Field(() => Float, { nullable: true })
  minimumOrderAmount?: number;

  @Field(() => Float, { nullable: true })
  maximumOrderAmount?: number;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Number, { nullable: true })
  estimatedDeliveryDays?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class GetShippingMethods {
  @Field(() => [ShippingMethod])
  shippingMethods: ShippingMethod[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  page: number;

  @Field(() => Number)
  pageSize: number;

  @Field(() => Number)
  pageCount: number;
}
