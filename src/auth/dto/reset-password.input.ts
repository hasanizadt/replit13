import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 characters' })
  otp: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Length(6, 30, { message: 'Password must be between 6 and 30 characters' })
  password: string;
}