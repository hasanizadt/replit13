import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Category } from '../../category/models/category.model';
import { ProductMeta } from './meta.model';
import { Shop } from './shop.model';
import { Seller } from './seller.model';
import { Brand } from './brand.model';
import { Flash } from './flash.model';
import { Tag } from './tag.model';
import { ProductAttribute } from './product-attribute.model';
import { PaginationMeta } from '../../shared/models/meta.model';
import { ProductImage } from './product-image.model';

// Using PaginationMeta from shared module instead of local definition
export { PaginationMeta };

export enum DiscountUnit {
  FLAT = 'FLAT',
  PERCENT = 'PERCENT',
}

export enum TaxUnit {
  FLAT = 'FLAT',
  PERCENT = 'PERCENT',
}

@ObjectType()
export class Product {
  @Field(() => String)
  id: string;

  @Field(() => Int)
  stock: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  tax: number;

  @Field(() => String, { nullable: true })
  taxUnit?: string;

  @Field(() => Float)
  discount: number;

  @Field(() => String, { nullable: true })
  discountUnit?: string;

  @Field(() => String, { nullable: true })
  sellerId?: string;
  @Field(() => String)
  name: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  shopId?: string;

  @Field(() => String, { nullable: true })
  categoryId?: string;

  @Field(() => String, { nullable: true })
  brandId?: string;

  @Field(() => String, { nullable: true })
  unit?: string;

  @Field(() => Int, { nullable: true })
  minPurchase?: number;

  @Field(() => Float)
  price: number;


  @Field(() => Float, { nullable: true })
  totalPrice?: number;

  @Field(() => Boolean, { nullable: true })
  refundAble?: boolean;

  @Field(() => [ProductImage])
  images: ProductImage[];

  @Field(() => String, { nullable: true })
  youtubeLink?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  specification?: string;

  @Field(() => Boolean, { nullable: true })
  visibility?: boolean;

  @Field(() => Boolean)
  isApproved: boolean;

  @Field(() => Boolean)
  isHide: boolean;

  @Field(() => Float, { nullable: true })
  reviewRating?: number;

  @Field(() => Int)
  totalReviews: number;

  @Field(() => Int)
  viewCount: number;

  @Field(() => Int)
  salesCount: number;

  @Field(() => Boolean)
  isFeatured: boolean;

  @Field(() => String, { nullable: true })
  estimateDelivery?: string;

  @Field(() => String, { nullable: true })
  warranty?: string;

  @Field(() => Boolean, { nullable: true })
  showStock?: boolean;

  @Field(() => String, { nullable: true })
  disclaimer?: string;

  @Field(() => String, { nullable: true })
  flashId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  // Relations
  @Field(() => Shop, { nullable: true })
  shop?: Shop;

  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => Brand, { nullable: true })
  brand?: Brand;

  @Field(() => [Tag], { nullable: true })
  tags?: Tag[];

  @Field(() => Flash, { nullable: true })
  flash?: Flash;

  @Field(() => ProductMeta, { nullable: true })
  meta?: ProductMeta;

  @Field(() => [ProductAttribute], { nullable: true }) //Corrected this line
  attributes?: ProductAttribute[];
}

@ObjectType()
export class GetProducts {
  @Field(() => [Product], { nullable: true })
  results?: Product[];

  @Field(() => PaginationMeta, { nullable: true })
  meta?: PaginationMeta;
}