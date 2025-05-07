import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

enum DiscountUnit {
  FLAT = 'FLAT',
  PERCENT = 'PERCENT',
}

enum TaxUnit {
  FLAT = 'FLAT',
  PERCENT = 'PERCENT',
}

@InputType()
export class UpdateProductInput {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  shopId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  sellerId?: string;

  @Field(() => String, { nullable: true, description: 'For backward compatibility' })
  @IsUUID()
  @IsOptional()
  mainCategoryId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  brandId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  unit?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(1)
  minPurchase?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @Field(() => String, { nullable: true })
  @IsEnum(DiscountUnit)
  @IsOptional()
  discountUnit?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  @Min(0)
  tax?: number;

  @Field(() => String, { nullable: true })
  @IsEnum(TaxUnit)
  @IsOptional()
  taxUnit?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  refundAble?: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  youtubeLink?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  specification?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  visibility?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isHide?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  estimateDelivery?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  warranty?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  showStock?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  disclaimer?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  flashId?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @Field(() => [String], { nullable: true, description: 'For backward compatibility' })
  @IsArray()
  @IsOptional()
  subCategoryIds?: string[];
}