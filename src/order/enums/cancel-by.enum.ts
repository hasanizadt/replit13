import { registerEnumType } from '@nestjs/graphql';

export enum CancelBy {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

registerEnumType(CancelBy, {
  name: 'CancelBy',
  description: 'Who canceled the order',
});