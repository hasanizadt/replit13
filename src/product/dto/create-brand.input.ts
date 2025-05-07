import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

@InputType()
export class CreateBrandInput {
  @Field(() => String)
  @IsString()
  name: string;

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