import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateFlashInput {
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

  @Field(() => Date)
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @Field(() => Date)
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  banner?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}