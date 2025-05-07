import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/models/user.model';
import { Product } from '../../product/models/product.model';
import { Bank } from './bank.model';

@ObjectType()
export class Seller {
  @Field(() => String)
  id: string;

  @Field(() => String)
  shopName: string;

  @Field(() => String)
  phone: string;

  @Field(() => String, { nullable: true })
  logo: string;

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String)
  address: string;

  @Field(() => String, { nullable: true })
  metaTitle: string;

  @Field(() => String, { nullable: true })
  metaDescription: string;

  @Field(() => Boolean)
  isVerified: boolean;

  @Field(() => Boolean)
  isBanned: boolean;

  @Field(() => String)
  userId: string;

  @Field(() => User)
  user: User;

  @Field(() => Bank, { nullable: true })
  bank: Bank;

  @Field(() => [Product], { nullable: true })
  products: Product[];

  @Field(() => Number, { defaultValue: 0 })
  totalRating: number;

  @Field(() => Number, { defaultValue: 0 })
  ratingCount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}

@ObjectType('SellerMetaData')
export class MetaData {
  @Field(() => Number)
  totalItems: number;

  @Field(() => Number)
  itemCount: number;

  @Field(() => Number)
  itemsPerPage: number;

  @Field(() => Number)
  totalPages: number;

  @Field(() => Number)
  currentPage: number;
}

@ObjectType()
export class GetSellersList {
  @Field(() => [Seller])
  results: Seller[];

  @Field(() => MetaData)
  meta: MetaData;
}