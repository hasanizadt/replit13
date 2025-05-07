import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class UpdateBankInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Bank ID is required' })
  @IsUUID('4', { message: 'Invalid bank ID format' })
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Bank name must be a string' })
  @MinLength(2, { message: 'Bank name must be at least 2 characters' })
  @MaxLength(100, { message: 'Bank name must be at most 100 characters' })
  bankName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Account title must be a string' })
  @MinLength(3, { message: 'Account title must be at least 3 characters' })
  @MaxLength(100, { message: 'Account title must be at most 100 characters' })
  accountTitle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Account number must be a string' })
  @MinLength(5, { message: 'Account number must be at least 5 characters' })
  @MaxLength(50, { message: 'Account number must be at most 50 characters' })
  accountNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Routing number must be a string' })
  routingNumber?: string;
}