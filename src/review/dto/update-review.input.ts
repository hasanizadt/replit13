import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

@InputType()
export class UpdateReviewInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Review ID is required' })
  @IsUUID('4', { message: 'Invalid review ID format' })
  id: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Comment must be a string' })
  comment?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isVerified must be a boolean' })
  isVerified?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'isPublished must be a boolean' })
  isPublished?: boolean;
}