import { Field, Float, InputType } from '@nestjs/graphql';
import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class OrderProductInput {
  @Field(() => String)
  @IsString()
  productId: string;

  @Field(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Field(() => [OrderAttributeInput], { nullable: true })
  @IsOptional()
  @IsArray()
  attributes?: OrderAttributeInput[];
}

@InputType()
export class OrderAttributeInput {
  @Field(() => String)
  @IsString()
  id: string;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  variant: string;
}

@InputType()
export class CreateOrderInput {
  @Field(() => [OrderProductInput])
  @IsArray()
  products: OrderProductInput[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @Field(() => String)
  @IsString()
  shippingAddressId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  billingAddressId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field(() => String)
  @IsString()
  paymentMethod: string;
}