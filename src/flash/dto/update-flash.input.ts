import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsDate, IsOptional, IsArray, IsUUID, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class UpdateFlashInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Flash ID is required' })
  @IsString({ message: 'Flash ID must be a string' })
  @IsUUID('4', { message: 'Flash ID must be a valid UUID' })
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title must be less than 100 characters' })
  title?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'Start date must be a valid date' })
  @Type(() => Date)
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate({ message: 'End date must be a valid date' })
  @Type(() => Date)
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray({ message: 'Product IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each product ID must be a valid UUID' })
  productIds?: string[];
}