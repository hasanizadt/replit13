import { Field, InputType, Int } from '@nestjs/graphql';
import { IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class AddToCartInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsUUID('4', { message: 'Invalid product ID format' })
  productId: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Seller ID is required' })
  @IsUUID('4', { message: 'Invalid seller ID format' })
  sellerId: string;

  @Field(() => Int)
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  reserved: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsJSON({ message: 'Attributes must be a valid JSON string' })
  attributes?: string;
}