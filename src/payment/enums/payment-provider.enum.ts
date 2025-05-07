import { registerEnumType } from '@nestjs/graphql';

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  SSLCOMMERZ = 'SSLCOMMERZ',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

registerEnumType(PaymentProvider, {
  name: 'PaymentProvider',
  description: 'Payment provider options',
});