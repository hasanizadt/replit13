import { Product } from './product.model';
import { Seller, MetaData as SellerMeta } from '../../seller/models/seller.model';

// Using Seller from seller module instead of local definition
export { Seller };

// Using adjusted MetaData (renamed to SellerMeta) from seller module
export { SellerMeta };

// Still defining GetProductSellers locally since it's specific to this module
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetProductSellers {
  @Field(() => [Seller], { nullable: true })
  results?: Seller[];

  @Field(() => SellerMeta, { nullable: true })
  meta?: SellerMeta;
}