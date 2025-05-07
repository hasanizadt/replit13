import { InputType, Field, Int } from '@nestjs/graphql';
import { IsDate, IsEnum, IsInt, IsOptional, Min, IsString } from 'class-validator';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

@InputType()
export class LogQueryInput {
  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  levels?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  context?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  limit: number = 20;
}
