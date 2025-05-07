import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Product } from '../../product/models/product.model';

@ObjectType()
export class Flash {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => [Product], { nullable: true })
  products?: Product[];
}

@ObjectType()
export class FlashMeta {
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
export class GetFlashSales {
  @Field(() => [Flash])
  results: Flash[];

  @Field(() => FlashMeta)
  meta: FlashMeta;
}