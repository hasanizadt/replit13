import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateTagInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be less than 50 characters' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}