import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean, IsUUID } from 'class-validator';

@InputType()
export class UpdateShippingZoneInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  countries?: string[];

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

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
