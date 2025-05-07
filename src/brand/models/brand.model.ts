
import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Product } from '../../product/models/product.model';

@ObjectType()
export class Brand {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => Boolean)
  featured: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [Product], { nullable: true })
  products?: Product[];
}

@ObjectType()
export class BrandMeta {
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
export class GetBrands {
  @Field(() => [Brand])
  results: Brand[];

  @Field(() => BrandMeta)
  meta: BrandMeta;
}
