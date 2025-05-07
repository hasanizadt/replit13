import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class CreateAddressInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fullName?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  gender?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  address: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  city: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  country: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  area: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  postal?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
