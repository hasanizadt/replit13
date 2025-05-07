import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateBankInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Bank name is required' })
  @IsString({ message: 'Bank name must be a string' })
  @MinLength(2, { message: 'Bank name must be at least 2 characters' })
  @MaxLength(100, { message: 'Bank name must be at most 100 characters' })
  bankName: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Account title is required' })
  @IsString({ message: 'Account title must be a string' })
  @MinLength(3, { message: 'Account title must be at least 3 characters' })
  @MaxLength(100, { message: 'Account title must be at most 100 characters' })
  accountTitle: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Account number is required' })
  @IsString({ message: 'Account number must be a string' })
  @MinLength(5, { message: 'Account number must be at least 5 characters' })
  @MaxLength(50, { message: 'Account number must be at most 50 characters' })
  accountNumber: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Routing number must be a string' })
  routingNumber?: string;
}