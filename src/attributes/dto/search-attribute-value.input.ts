import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { SortDirection } from '../../common/enums/sort-direction.enum';

@InputType()
export class SearchAttributeValueInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  attributeId?: string;

  @Field(() => String, { defaultValue: 'createdAt' })
  @IsString()
  sortBy: string = 'createdAt';

  @Field(() => SortDirection, { defaultValue: SortDirection.DESC })
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.DESC;
}
