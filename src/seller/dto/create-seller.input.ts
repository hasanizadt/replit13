import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateSellerInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Shop name is required' })
  @IsString({ message: 'Shop name must be a string' })
  @MinLength(3, { message: 'Shop name must be at least 3 characters' })
  @MaxLength(100, { message: 'Shop name must be at most 100 characters' })
  shopName: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsPhoneNumber(null, { message: 'Phone number must be valid' })
  phone: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Logo must be a valid URL' })
  logo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Banner must be a valid URL' })
  banner?: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Address is required' })
  @IsString({ message: 'Address must be a string' })
  @MinLength(10, { message: 'Address must be at least 10 characters' })
  @MaxLength(255, { message: 'Address must be at most 255 characters' })
  address: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Meta title must be a string' })
  @MaxLength(100, { message: 'Meta title must be at most 100 characters' })
  metaTitle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Meta description must be a string' })
  @MaxLength(255, { message: 'Meta description must be at most 255 characters' })
  metaDescription?: string;
}