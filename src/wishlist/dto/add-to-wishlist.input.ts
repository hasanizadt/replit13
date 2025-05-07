import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class AddToWishlistInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsString({ message: 'Product ID must be a string' })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId: string;
}