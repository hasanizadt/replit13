import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateShippingZoneInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => [String])
  @IsNotEmpty()
  @IsArray()
  countries: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  states?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  cities?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  zipCodes?: string[];

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
