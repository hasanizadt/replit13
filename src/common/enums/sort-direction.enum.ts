import { registerEnumType } from '@nestjs/graphql';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
  description: 'Sort direction for queries (ascending or descending)',
});