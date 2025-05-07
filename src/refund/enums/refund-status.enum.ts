import { registerEnumType } from '@nestjs/graphql';

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

registerEnumType(RefundStatus, {
  name: 'RefundStatus',
  description: 'The status of a refund',
});