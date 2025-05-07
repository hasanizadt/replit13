import { Field, InputType, Int } from '@nestjs/graphql';
import { IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

@InputType()
export class UpdateCartInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Cart ID is required' })
  @IsUUID('4', { message: 'Invalid cart ID format' })
  id: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Reserved quantity must be a number' })
  @Min(1, { message: 'Reserved quantity must be at least 1' })
  reserved?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsJSON({ message: 'Attributes must be a valid JSON string' })
  attributes?: string;
}