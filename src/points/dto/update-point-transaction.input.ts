import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, IsNumber, IsDate, IsBoolean, IsUUID, Min } from 'class-validator';
import { PointTransactionType } from '../models/point.model';

@InputType()
export class UpdatePointTransactionInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  points?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  monetaryValue?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(PointTransactionType)
  type?: PointTransactionType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
