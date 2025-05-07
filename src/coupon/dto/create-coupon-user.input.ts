import { Field, InputType, Float, Int } from '@nestjs/graphql';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsEnum, 
  IsInt,
  IsUUID,
  Min,
  Max 
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountUnit } from '../models/discount-unit.enum';

@InputType()
export class CreateCouponUserInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString({ message: 'User ID must be a string' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Code is required' })
  @IsString({ message: 'Code must be a string' })
  code: string;

  @Field(() => Float)
  @IsNotEmpty({ message: 'Discount is required' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Discount must be a number with at most 2 decimal places' })
  @Min(0.1, { message: 'Discount must be at least 0.1' })
  @Type(() => Number)
  discount: number;

  @Field(() => DiscountUnit)
  @IsNotEmpty({ message: 'Discount unit is required' })
  @IsEnum(DiscountUnit, { message: 'Invalid discount unit' })
  discountUnit: DiscountUnit;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Points is required' })
  @IsInt({ message: 'Points must be an integer' })
  @Min(1, { message: 'Points must be at least 1' })
  @Type(() => Number)
  points: number;
}