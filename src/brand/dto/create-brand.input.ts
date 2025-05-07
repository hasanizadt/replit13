import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateBrandInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must be less than 100 characters' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Logo URL must be a string' })
  @IsUrl({}, { message: 'Logo must be a valid URL' })
  logo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean({ message: 'Featured status must be a boolean' })
  isFeatured?: boolean = false;
}