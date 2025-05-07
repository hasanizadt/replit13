import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class RemoveFromCartInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Cart ID is required' })
  @IsUUID('4', { message: 'Invalid cart ID format' })
  id: string;
}

@InputType()
export class ClearCartInput {
  @Field(() => Boolean, { defaultValue: true })
  confirm: boolean;
}