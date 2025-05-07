import { Field, InputType, Float } from '@nestjs/graphql';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsOptional, 
  IsDate, 
  IsUUID,
  MinLength, 
  MaxLength, 
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountUnit } from '../models/discount-unit.enum';

@InputType()
export class UpdateCouponInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Coupon ID is required' })
  @IsString({ message: 'Coupon ID must be a string' })
  @IsUUID('4', { message: 'Coupon ID must be a valid UUID' })
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must be less than 50 characters' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Code must be a string' })
  @MinLength(3, { message: 'Code must be at least 3 characters long' })
  @MaxLength(20, { message: 'Code must be less than 20 characters' })
  code?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Discount must be a number with at most 2 decimal places' })
  @Min(0.1, { message: 'Discount must be at least 0.1' })
  @Type(() => Number)
  discount?: number;

  @Field(() => DiscountUnit, { nullable: true })
  @IsOptional()
  @IsEnum(DiscountUnit, { message: 'Invalid discount unit, must be FLAT or PERCENT' })
  discountUnit?: DiscountUnit;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Minimum purchase must be a number with at most 2 decimal places' })
  @Min(0, { message: 'Minimum purchase must be at least 0' })
  @Type(() => Number)
  minimumPurchase?: number;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'Expiry date must be a valid date' })
  @Type(() => Date)
  expiresAt?: Date;
}