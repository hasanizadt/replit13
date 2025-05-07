import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, IsNumber, IsDate, IsBoolean, Min } from 'class-validator';
import { PointTransactionType } from '../models/point.model';

@InputType()
export class CreatePointTransactionInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  orderId?: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  points: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  monetaryValue?: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsEnum(PointTransactionType)
  type: PointTransactionType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
