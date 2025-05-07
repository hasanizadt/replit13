import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

@InputType()
export class SearchAddressInput {
  @Field(() => Number, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @Field(() => Number, { defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  onlyIsDefault?: boolean;

  @Field(() => String, { defaultValue: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @Field(() => String, { defaultValue: 'desc' })
  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc' = 'desc';
}
