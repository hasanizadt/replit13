import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @Field(() => Int)
  @IsNotEmpty({ message: 'Rating is required' })
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @Field(() => String)
  @IsNotEmpty({ message: 'Comment is required' })
  @IsString({ message: 'Comment must be a string' })
  comment: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid product ID format' })
  productId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid seller ID format' })
  sellerId?: string;
}