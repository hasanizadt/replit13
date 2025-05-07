import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKEDUP = 'PICKEDUP',
  ONTHEWAY = 'ONTHEWAY',
  DELIVERED = 'DELIVERED',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'The status of an order',
});