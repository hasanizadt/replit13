import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum EntityType {
  PRODUCT = 'PRODUCT',
  CATEGORY = 'CATEGORY',
  SUBCATEGORY = 'SUBCATEGORY',
  MAINCATEGORY = 'MAINCATEGORY',
  BRAND = 'BRAND',
  ATTRIBUTE = 'ATTRIBUTE',
  ATTRIBUTE_VALUE = 'ATTRIBUTE_VALUE',
  TAG = 'TAG',
}

registerEnumType(EntityType, {
  name: 'EntityType',
  description: 'The type of entity that can be translated',
});

@ObjectType()
export class Translation {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  entityType: string;

  @Field(() => String)
  entityId: string;

  @Field(() => String)
  field: string;

  @Field(() => String)
  language: string;

  @Field(() => String)
  value: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class TranslationPagination {
  @Field(() => [Translation])
  translations: Translation[];

  @Field(() => Number)
  totalCount: number;

  @Field(() => Number)
  pageCount: number;
}

@ObjectType()
export class SupportedLanguage {
  @Field(() => String)
  code: string;

  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  isDefault: boolean;

  @Field(() => Boolean)
  isActive: boolean;
}
