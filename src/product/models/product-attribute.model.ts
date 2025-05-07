import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from './product.model';

@ObjectType()
export class ProductAttribute {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  color?: string;

  @Field(() => String, { nullable: true })
  size?: string;

  @Field(() => String)
  productId: string;

  @Field(() => String, { nullable: true })
  attributeValueId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Product, { nullable: true })
  product?: Product;
}