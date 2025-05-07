import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateSellerInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  logo?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  banner?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}