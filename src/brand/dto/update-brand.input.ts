import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, MaxLength, MinLength } from 'class-validator';

@InputType()
export class UpdateBrandInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Brand ID is required' })
  @IsString({ message: 'Brand ID must be a string' })
  @IsUUID('4', { message: 'Brand ID must be a valid UUID' })
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must be less than 100 characters' })
  name?: string;

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

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean({ message: 'Featured status must be a boolean' })
  isFeatured?: boolean;
}