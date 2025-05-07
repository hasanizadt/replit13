
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Address {
  @Field(() => String)
  id: string;

  @Field(() => String)
  street: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  state: string;

  @Field(() => String)
  country: string;

  @Field(() => String)
  postalCode: string;

  @Field(() => Boolean)
  isDefault: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
