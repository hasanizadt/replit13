import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class AttributeValue {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  value: string;

  @Field(() => String)
  attributeId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class GetAttributeValues {
  @Field(() => [AttributeValue])
  attributeValues: AttributeValue[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  page: number;

  @Field(() => Number)
  pageSize: number;

  @Field(() => Number)
  pageCount: number;
}
