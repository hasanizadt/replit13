import { Field, ObjectType, ID } from '@nestjs/graphql';
import { ShippingMethod } from './shipping-method.model';

@ObjectType()
export class ShippingZone {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => [String])
  countries: string[];

  @Field(() => [String], { nullable: true })
  states?: string[];

  @Field(() => [String], { nullable: true })
  cities?: string[];

  @Field(() => [String], { nullable: true })
  zipCodes?: string[];

  @Field(() => [ShippingMethod], { nullable: true })
  shippingMethods?: ShippingMethod[];

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class GetShippingZones {
  @Field(() => [ShippingZone])
  shippingZones: ShippingZone[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  page: number;

  @Field(() => Number)
  pageSize: number;

  @Field(() => Number)
  pageCount: number;
}
