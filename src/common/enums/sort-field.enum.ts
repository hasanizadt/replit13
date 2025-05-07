import { registerEnumType } from '@nestjs/graphql';

export enum SortField {
  ID = 'id',
  NAME = 'name',
  TITLE = 'title',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  QUANTITY = 'quantity',
  STATUS = 'status',
  EMAIL = 'email',
  USERNAME = 'username',
  ORDER_NUMBER = 'orderNumber',
}

registerEnumType(SortField, {
  name: 'SortField',
  description: 'Fields that can be used for sorting',
});