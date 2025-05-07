import { Field, ObjectType, ID } from '@nestjs/graphql';
import { AttributeValue } from './attribute-value.model';

@ObjectType()
export class Attribute {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [AttributeValue], { nullable: true })
  values?: AttributeValue[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class GetAttributes {
  @Field(() => [Attribute])
  attributes: Attribute[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  page: number;

  @Field(() => Number)
  pageSize: number;

  @Field(() => Number)
  pageCount: number;
}
