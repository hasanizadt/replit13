import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class Address {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  phone: string;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  city: string;

  @Field(() => String)
  country: string;

  @Field(() => String)
  area: string;

  @Field(() => String, { nullable: true })
  postal?: string;

  @Field(() => Boolean)
  isDefault: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class GetAddresses {
  @Field(() => [Address])
  addresses: Address[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  page: number;

  @Field(() => Number)
  pageSize: number;

  @Field(() => Number)
  pageCount: number;
}
