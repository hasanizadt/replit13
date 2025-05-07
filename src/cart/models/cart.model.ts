import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { Product } from '../../product/models/product.model';
import { Seller } from '../../seller/models/seller.model';

@ObjectType()
export class Cart {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  productId: string;

  @Field(() => String)
  sellerId: string;

  @Field(() => Int)
  reserved: number;

  @Field(() => String, { nullable: true })
  attributes: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => User)
  user: User;

  @Field(() => Product)
  product: Product;

  @Field(() => Seller)
  seller: Seller;
}

@ObjectType()
export class CartMeta {
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
export class GetCarts {
  @Field(() => [Cart])
  results: Cart[];

  @Field(() => CartMeta)
  meta: CartMeta;
}

@ObjectType()
export class CartSummary {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  shipping: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  total: number;
}