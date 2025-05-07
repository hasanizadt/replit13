import { InputType, Field, Int } from '@nestjs/graphql';
import { 
  IsArray, 
  IsBoolean, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUrl,
  MinLength,
  MaxLength
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { WebhookEvent } from '../models/webhook.model';

@InputType()
export class CreateWebhookInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @Field(() => String)
  @IsUrl({ require_tld: false }, { message: 'Invalid URL format' })
  @IsNotEmpty()
  url: string;

  @Field(() => [String])
  @IsArray()
  @IsNotEmpty()
  events: string[];
}

@InputType()
export class UpdateWebhookInput {
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

  @Field(() => String, { nullable: true })
  @IsUrl({ require_tld: false }, { message: 'Invalid URL format' })
  @IsOptional()
  url?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  events?: string[];

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class SearchWebhookInput {
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
  event?: string;

  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  limit: number = 20;
}

@InputType()
export class SearchWebhookLogInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  webhookId: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  event?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  success?: boolean;

  @Field(() => Int, { defaultValue: 1 })
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  limit: number = 20;
}

@InputType()
export class TriggerWebhookInput {
  @Field(() => String)
  @IsEnum(WebhookEvent)
  event: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  payload: string;
}
