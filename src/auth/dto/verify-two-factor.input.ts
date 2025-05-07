import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class VerifyTwoFactorInput {
  @Field()
  @IsNotEmpty({ message: 'Two-factor code is required' })
  @IsString()
  @Length(6, 6, { message: 'Code must be 6 characters' })
  code: string;
}