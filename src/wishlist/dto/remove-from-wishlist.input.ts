import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class RemoveFromWishlistInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Wishlist ID is required' })
  @IsString({ message: 'Wishlist ID must be a string' })
  @IsUUID('4', { message: 'Wishlist ID must be a valid UUID' })
  id: string;
}