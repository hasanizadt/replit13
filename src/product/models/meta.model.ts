import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from './product.model';

@ObjectType('ProductMeta')
export class ProductMeta {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  productId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Product, { nullable: true })
  product?: Product;
}