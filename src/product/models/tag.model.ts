import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from './product.model';

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

  @Field(() => [Product], { nullable: true })
  products?: Product[];
}

@ObjectType('TagMeta')
export class TagMeta {
  @Field(() => Number, { nullable: true })
  itemCount?: number;

  @Field(() => Number, { nullable: true })
  totalItems?: number;

  @Field(() => Number, { nullable: true })
  itemsPerPage?: number;

  @Field(() => Number, { nullable: true })
  totalPages?: number;

  @Field(() => Number, { nullable: true })
  currentPage?: number;
}

@ObjectType()
export class GetTags {
  @Field(() => [Tag], { nullable: true })
  results?: Tag[];

  @Field(() => TagMeta, { nullable: true })
  meta?: TagMeta;
}