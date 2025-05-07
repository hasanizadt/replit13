import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductImage {
  @Field(() => String)
  id: string;

  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  alt?: string;

  @Field(() => Int)
  order: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  productId: string;
}
