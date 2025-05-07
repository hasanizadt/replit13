import { Field, ObjectType, Int } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { Product } from '../../product/models/product.model';

@ObjectType()
export class Wishlist {
  @Field(() => String)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  productId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => User)
  user: User;

  @Field(() => Product)
  product: Product;
}

@ObjectType()
export class WishlistMeta {
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
export class GetWishlists {
  @Field(() => [Wishlist])
  results: Wishlist[];

  @Field(() => WishlistMeta)
  meta: WishlistMeta;
}