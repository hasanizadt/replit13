import { registerEnumType } from '@nestjs/graphql';

export enum DiscountUnit {
  FLAT = 'FLAT',
  PERCENT = 'PERCENT',
}

registerEnumType(DiscountUnit, {
  name: 'DiscountUnit',
  description: 'The unit of discount (FLAT or PERCENT)',
});