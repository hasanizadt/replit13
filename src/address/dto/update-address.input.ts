import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class UpdateAddressInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  gender?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  area?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  postal?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
