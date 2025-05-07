import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';

@InputType()
export class RedeemPointsInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  points: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  orderId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
