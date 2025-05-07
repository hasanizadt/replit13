import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { Product } from '../../product/models/product.model';
import { Seller } from '../../seller/models/seller.model';
import { PaginationMeta } from '../../shared/models/meta.model';

// Using PaginationMeta from shared module instead of local definition
export { PaginationMeta };

@ObjectType()
export class Review {
  @Field(() => String)
  id: string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => String, { nullable: true })
  sellerId?: string;

  @Field(() => Number)
  rating: number;

  @Field(() => String)
  comment: string;

  @Field(() => String)
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => String, { nullable: true })
  productId: string;

  @Field(() => Product, { nullable: true })
  product: Product;


  @Field(() => Seller, { nullable: true })
  seller: Seller;

  @Field(() => Boolean)
  isVerified: boolean;

  @Field(() => Boolean)
  isPublished: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class GetReviews {
  @Field(() => [Review])
  results: Review[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}