import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateAlertConfigInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  condition: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  threshold: string;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  enabled: boolean;

  @Field(() => [String])
  @IsString({ each: true })
  notificationChannels: string[];
}

@InputType()
export class UpdateAlertConfigInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  condition?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  threshold?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @Field(() => [String], { nullable: true })
  @IsString({ each: true })
  @IsOptional()
  notificationChannels?: string[];
}
