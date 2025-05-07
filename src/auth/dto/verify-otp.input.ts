import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class VerifyOtpInput {
  @Field()
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 characters' })
  otp: string;
}