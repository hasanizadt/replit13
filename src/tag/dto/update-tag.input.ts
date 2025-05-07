import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class UpdateTagInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Tag ID is required' })
  @IsString({ message: 'Tag ID must be a string' })
  @IsUUID('4', { message: 'Tag ID must be a valid UUID' })
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be less than 50 characters' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}