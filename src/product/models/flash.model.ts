import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from './product.model';

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

  @Field(() => [Product], { nullable: true })
  products?: Product[];
}

@ObjectType('FlashMeta')
export class FlashMeta {
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
export class GetFlashes {
  @Field(() => [Flash], { nullable: true })
  results?: Flash[];

  @Field(() => FlashMeta, { nullable: true })
  meta?: FlashMeta;
}