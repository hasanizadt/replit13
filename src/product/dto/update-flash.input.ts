import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class UpdateFlashInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

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