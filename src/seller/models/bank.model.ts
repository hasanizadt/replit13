import { Field, ObjectType } from '@nestjs/graphql';
import { Seller } from './seller.model';

@ObjectType()
export class Bank {
  @Field(() => String)
  id: string;

  @Field(() => String)
  bankName: string;

  @Field(() => String)
  accountTitle: string;

  @Field(() => String)
  accountNumber: string;

  @Field(() => String, { nullable: true })
  routingNumber: string;

  @Field(() => String)
  sellerId: string;

  @Field(() => Seller)
  seller: Seller;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}