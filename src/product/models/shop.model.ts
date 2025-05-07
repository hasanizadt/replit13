import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from './product.model';
import { User } from '../../user/models/user.model';

@ObjectType()
export class Shop {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => String, { nullable: true })
  banner?: string;

  @Field(() => String)
  ownerId: string;

  @Field(() => Boolean)
  isVerified: boolean;

  @Field(() => Boolean)
  isFeatured: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => User, { nullable: true })
  owner?: User;

  @Field(() => [Product], { nullable: true })
  products?: Product[];
}

@ObjectType('ShopMeta')
export class ShopMeta {
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
export class GetShops {
  @Field(() => [Shop], { nullable: true })
  results?: Shop[];

  @Field(() => ShopMeta, { nullable: true })
  meta?: ShopMeta;
}