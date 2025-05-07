import { InputType, Field, Int } from '@nestjs/graphql';
import { 
  IsArray, 
  IsBoolean, 
  IsDate, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString,
  MinLength,
  MaxLength
} from 'class-validator';
import { ApiKeyPermission } from '../models/api-key.model';
import { Transform, Type } from 'class-transformer';

@InputType()
export class CreateApiKeyInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  permissions: string[];

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;
}

@InputType()
export class UpdateApiKeyInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiresAt?: Date;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class SearchApiKeyInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  search?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  permission?: string;
  
  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  expired?: boolean;

  @Field(() => Int, { defaultValue: 1 })
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @Transform(({ value }) => parseInt(value))
  limit: number = 20;
}

@InputType()
export class ValidateApiKeyInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  key: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  requiredPermission: string;
}
