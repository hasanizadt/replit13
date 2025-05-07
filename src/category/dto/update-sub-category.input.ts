import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateSubCategoryInput {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string; // This will translate to parentId in the new schema

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  order?: number;

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