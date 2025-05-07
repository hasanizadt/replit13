import { Field, ObjectType } from '@nestjs/graphql';
import { Seller } from './seller.model';
import { Meta } from '../../shared/models/meta.model';

@ObjectType()
export class GetSellers {
  @Field(() => [Seller])
  results: Seller[];

  @Field(() => Meta)
  meta: Meta;
}