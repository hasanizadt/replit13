import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentTransaction } from './models/payment-transaction.model';
import { GetPaymentTransactions } from './models/get-payment-transactions.model';
import { CreatePaymentTransactionInput } from './dto/create-payment-transaction.input';
import { UpdatePaymentTransactionInput } from './dto/update-payment-transaction.input';
import { SearchPaymentTransactionInput } from './dto/search-payment-transaction.input';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => PaymentTransaction)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create a new payment transaction (Admin only)
   */
  @Mutation(() => PaymentTransaction)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createPaymentTransaction(
    @Args('createPaymentTransactionInput') createPaymentTransactionInput: CreatePaymentTransactionInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.paymentService.createPaymentTransaction(userId, createPaymentTransactionInput);
  }

  /**
   * Get all payment transactions with pagination and filtering (Admin only)
   */
  @Query(() => GetPaymentTransactions)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getPaymentTransactions(@Args('searchInput') searchInput: SearchPaymentTransactionInput) {
    return this.paymentService.findAllPaymentTransactions(searchInput);
  }

  /**
   * Get my payment transactions with pagination and filtering (User only)
   */
  @Query(() => GetPaymentTransactions)
  @UseGuards(AuthGuard)
  async getMyPaymentTransactions(
    @Args('searchInput') searchInput: SearchPaymentTransactionInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.paymentService.findPaymentTransactionsByUserId(userId, searchInput);
  }

  /**
   * Get a payment transaction by ID (Admin and User - own transactions)
   */
  @Query(() => PaymentTransaction)
  @UseGuards(AuthGuard)
  async getPaymentTransactionById(@Args('id') id: string, @Context() context) {
    const { user } = context.req;
    const transaction = await this.paymentService.findPaymentTransactionById(id);

    // Check if the user has permission to view this transaction
    if (user.role === 'ADMIN') {
      return transaction;
    } else if (transaction.userId === user.id) {
      return transaction;
    }

    throw new Error('You do not have permission to view this transaction');
  }

  /**
   * Update a payment transaction (Admin only)
   */
  @Mutation(() => PaymentTransaction)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updatePaymentTransaction(
    @Args('updatePaymentTransactionInput') updatePaymentTransactionInput: UpdatePaymentTransactionInput,
  ) {
    return this.paymentService.updatePaymentTransaction(updatePaymentTransactionInput);
  }

  /**
   * Process payment for an order (User only)
   */
  @Mutation(() => PaymentTransaction)
  @UseGuards(AuthGuard)
  async processPayment(
    @Args('orderId') orderId: string,
    @Args('paymentMethod') paymentMethod: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.paymentService.processPayment(userId, orderId, paymentMethod);
  }
}