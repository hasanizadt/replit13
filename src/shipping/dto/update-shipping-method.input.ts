import { Field, InputType, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, Max } from 'class-validator';

@InputType()
export class UpdateShippingMethodInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  shippingZoneId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

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

  @Field(() => Boolean, { nullable: true })
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
