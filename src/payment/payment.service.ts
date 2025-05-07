import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentTransactionInput } from './dto/create-payment-transaction.input';
import { UpdatePaymentTransactionInput } from './dto/update-payment-transaction.input';
import { SearchPaymentTransactionInput } from './dto/search-payment-transaction.input';
import { OrderService } from '../order/order.service';
import { PaymentTransactionStatus } from './enums/payment-transaction-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService,
  ) {}

  /**
   * Create a new payment transaction
   */
  async createPaymentTransaction(userId: string, data: CreatePaymentTransactionInput) {
    // Check if the order exists
    const order = await this.prisma.order.findFirst({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${data.orderId} not found`);
    }

    // Create the payment transaction
    const transaction = await (this.prisma as any).pointTransaction.create({
      data: {
        userId,
        orderId: data.orderId,
        amount: data.amount,
        provider: data.provider,
        transactionId: data.transactionId,
      },
      include: {
        user: true,
        order: true,
      },
    });

    return transaction;
  }

  /**
   * Get all payment transactions with pagination and filtering
   */
  async findAllPaymentTransactions(searchInput: SearchPaymentTransactionInput) {
    const { page = 1, limit = 10, userId, orderId, provider, status, sortBy = 'createdAt', sortOrder = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where conditions
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (provider) {
      where.provider = provider;
    }

    if (status) {
      where.status = status;
    }

    // Get the total count
    const totalItems = await (this.prisma as any).pointTransaction.count({ where });

    // Get the payment transactions
    const transactions = await (this.prisma as any).pointTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: true,
        order: true,
      },
    });

    // Return with pagination metadata
    return {
      results: transactions,
      meta: {
        totalItems,
        itemCount: transactions.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get payment transactions by user ID with pagination and filtering
   */
  async findPaymentTransactionsByUserId(userId: string, searchInput: SearchPaymentTransactionInput) {
    // Add userId to the search input
    const updatedSearchInput = {
      ...searchInput,
      userId,
    };

    return this.findAllPaymentTransactions(updatedSearchInput);
  }

  /**
   * Get a payment transaction by its ID
   */
  async findPaymentTransactionById(id: string) {
    const transaction = await (this.prisma as any).pointTransaction.findUnique({
      where: { id },
      include: {
        user: true,
        order: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Payment transaction with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Update a payment transaction status
   */
  async updatePaymentTransaction(data: UpdatePaymentTransactionInput) {
    const transaction = await (this.prisma as any).pointTransaction.findUnique({
      where: { id: data.id },
      include: {
        order: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Payment transaction with ID ${data.id} not found`);
    }

    // Update the payment transaction
    const updatedTransaction = await (this.prisma as any).pointTransaction.update({
      where: { id: data.id },
      data: {
        status: data.status,
        transactionId: data.transactionId || transaction.transactionId,
      },
      include: {
        user: true,
        order: true,
      },
    });

    // If the payment is completed, update the order's payment status
    if (data.status === PaymentTransactionStatus.SUCCESS) {
      await this.orderService.updatePaymentStatus(transaction.orderId, true);
    }

    return updatedTransaction;
  }

  /**
   * Process payment (this is a placeholder for actual payment processing)
   * In a real application, this would integrate with payment gateways
   */
  async processPayment(userId: string, orderId: string, paymentMethod: string) {
    // Get the order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Map payment method to provider
    let provider = 'STRIPE';
    if (paymentMethod === 'paypal') {
      provider = 'PAYPAL';
    } else if (paymentMethod === 'bank_transfer') {
      provider = 'BANK_TRANSFER';
    } else if (paymentMethod === 'sslcommerz') {
      provider = 'SSLCOMMERZ';
    } else if (paymentMethod === 'cash_on_delivery') {
      provider = 'CASH_ON_DELIVERY';
    }

    // Create a payment transaction
    const transaction = await this.createPaymentTransaction(userId, {
      orderId,
      amount: order.total,
      provider: provider as any,
    });

    // For cash on delivery, mark as completed automatically
    if (provider === 'CASH_ON_DELIVERY') {
      await this.updatePaymentTransaction({
        id: transaction.id,
        status: PaymentTransactionStatus.SUCCESS,
      });
    }

    return transaction;
  }
}