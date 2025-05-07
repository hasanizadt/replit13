import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty({ message: 'Old password is required' })
  @IsString()
  oldPassword: string;

  @Field()
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @Length(6, 30, { message: 'Password must be between 6 and 30 characters' })
  newPassword: string;
}