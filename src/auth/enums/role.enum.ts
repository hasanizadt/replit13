
import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  SELLER = 'SELLER',
  STAFF = 'STAFF'
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User role enumeration',
});
