import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { 
  IsEnum, 
  IsNotEmpty, 
  IsOptional,
  IsString, 
  ValidateIf, 
  IsInt, 
  Min, 
  IsUUID 
} from 'class-validator';
import { EntityType } from '../models/translation.model';

@InputType()
export class CreateTranslationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  field: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  language: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  value: string;
}

@InputType()
export class UpdateTranslationInput {
  @Field(() => String)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  value?: string;
}

@InputType()
export class GetTranslationsInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  field?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  language?: string;
}

@InputType()
export class SearchTranslationsInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  entityType?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  language?: string;

  @Field(() => Number, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Number, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  limit: number = 20;
}

@InputType()
export class BulkTranslationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @Field(() => [TranslationItem])
  translations: TranslationItem[];
}

@InputType()
export class TranslationItem {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  field: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  language: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  value: string;
}
