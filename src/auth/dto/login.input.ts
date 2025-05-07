import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Length(6, 30, { message: 'Password must be between 6 and 30 characters' })
  password: string;
}