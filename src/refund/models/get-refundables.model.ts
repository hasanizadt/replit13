import { Field, ObjectType } from '@nestjs/graphql';
import { Refundable } from './refundable.model';
import { Meta } from '../../shared/models/meta.model';

@ObjectType()
export class GetRefundables {
  @Field(() => [Refundable])
  results: Refundable[];

  @Field(() => Meta)
  meta: Meta;
}