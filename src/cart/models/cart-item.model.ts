import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { Product } from '../../product/models/product.model';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class CartItem {
  @Field(() => String)
  id: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  subtotal: number;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: any;

  @Field(() => String)
  productId: string;

  @Field(() => String)
  variantId: string;

  @Field(() => String)
  userId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => Product)
  product: Product;
}

// Removing duplicate Product class as it's already imported from product.model.ts
// If additional fields are needed, they should be added to the original Product class