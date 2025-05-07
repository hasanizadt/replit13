import { Field, ObjectType } from '@nestjs/graphql';
import { Refund } from './refund.model';
import { Meta } from '../../shared/models/meta.model';

@ObjectType()
export class GetRefunds {
  @Field(() => [Refund])
  results: Refund[];

  @Field(() => Meta)
  meta: Meta;
}