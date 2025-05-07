import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Product } from '../../product/models/product.model';

@ObjectType()
export class Tag {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => [Product], { nullable: true })
  products?: Product[];
}

@ObjectType()
export class TagMeta {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  itemCount: number;

  @Field(() => Int)
  itemsPerPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;
}

@ObjectType()
export class GetTags {
  @Field(() => [Tag])
  results: Tag[];

  @Field(() => TagMeta)
  meta: TagMeta;
}