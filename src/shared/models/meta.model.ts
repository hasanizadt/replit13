
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  pageCount: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  perPage: number;
}

// Keep for backward compatibility, but rename the GraphQL type
@ObjectType('PaginationMetaType')
export class Meta extends PaginationMeta {}
