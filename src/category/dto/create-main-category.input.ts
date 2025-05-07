import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateMainCategoryInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  image?: string;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @Field(() => Number, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  order?: number = 0;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  seoKeywords?: string;
}