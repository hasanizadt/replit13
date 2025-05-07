import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class GoogleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field()
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field()
  @IsNotEmpty({ message: 'Google token is required' })
  @IsString()
  token: string;
}