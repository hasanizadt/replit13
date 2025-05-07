import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

@InputType()
export class UpdateBrandInput {
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
  description?: string;

  @Field(() => String, { nullable: true })
  @IsUrl()
  @IsOptional()
  logo?: string;

  @Field(() => String, { nullable: true })
  @IsUrl()
  @IsOptional()
  website?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}