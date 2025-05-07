import { registerEnumType } from '@nestjs/graphql';

export enum PaymentTransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  COMPLETED = 'SUCCESS', // Alias for SUCCESS, to maintain compatibility with existing code
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(PaymentTransactionStatus, {
  name: 'PaymentTransactionStatus',
  description: 'Status of a payment transaction',
});