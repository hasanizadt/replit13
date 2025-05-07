import { Field, InputType, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, Max } from 'class-validator';

@InputType()
export class CreateShippingMethodInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  shippingZoneId: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumOrderAmount?: number;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  estimatedDeliveryDays?: number;
}
