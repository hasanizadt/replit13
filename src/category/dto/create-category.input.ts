import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateCategoryInput {
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

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  // Backwards compatibility: accept mainCategoryId for parentId to maintain API compatibility
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  mainCategoryId?: string;

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