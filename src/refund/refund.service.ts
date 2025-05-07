import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundableInput } from './dto/create-refundable.input';
import { CreateRefundInput } from './dto/create-refund.input';
import { UpdateRefundStatusInput } from './dto/update-refund-status.input';
import { SearchRefundInput } from './dto/search-refund.input';
import { SearchRefundableInput } from './dto/search-refundable.input';

@Injectable()
export class RefundService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new refundable item
   */
  async createRefundable(userId: string, data: CreateRefundableInput) {
    // Check if the product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${data.productId} not found`);
    }

    // Check if the order exists
    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${data.orderId} not found`);
    }

    // Check if the seller exists
    const seller = await this.prisma.seller.findUnique({
      where: { id: data.sellerId },
    });

    if (!seller) {
      throw new NotFoundException(`Seller with ID ${data.sellerId} not found`);
    }

    // Check if the address exists
    const address = await this.prisma.address.findUnique({
      where: { id: data.addressId },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${data.addressId} not found`);
    }

    // Create the refundable item
    const refundable = await (this.prisma as any).refundable.create({
      data: {
        userId,
        productId: data.productId,
        orderId: data.orderId,
        sellerId: data.sellerId,
        addressId: data.addressId,
        quantity: data.quantity,
        variation: data.variation,
        couponDiscount: data.couponDiscount,
        amount: data.amount,
      },
      include: {
        user: true,
        product: true,
        order: true,
        seller: true,
        address: true,
      },
    });

    return refundable;
  }

  /**
   * Get all refundable items with pagination and filtering
   */
  async findAllRefundables(searchInput: SearchRefundableInput) {
    const { page = 1, limit = 10, userId, productId, orderId, sellerId, sortBy = 'createdAt', sortOrder = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where conditions
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (productId) {
      where.productId = productId;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    // Get the total count
    const totalItems = await (this.prisma as any).refundable.count({ where });

    // Get the refundable items
    const refundables = await (this.prisma as any).refundable.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: true,
        product: true,
        order: true,
        seller: true,
        address: true,
        refunds: true,
      },
    });

    // Return with pagination metadata
    return {
      results: refundables,
      meta: {
        totalItems,
        itemCount: refundables.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get refundable items by user ID with pagination and filtering
   */
  async findRefundablesByUserId(userId: string, searchInput: SearchRefundableInput) {
    // Add userId to the search input
    const updatedSearchInput = {
      ...searchInput,
      userId,
    };

    return this.findAllRefundables(updatedSearchInput);
  }

  /**
   * Get a refundable item by its ID
   */
  async findRefundableById(id: string) {
    const refundable = await (this.prisma as any).refundable.findUnique({
      where: { id },
      include: {
        user: true,
        product: true,
        order: true,
        seller: true,
        address: true,
        refunds: true,
      },
    });

    if (!refundable) {
      throw new NotFoundException(`Refundable item with ID ${id} not found`);
    }

    return refundable;
  }

  /**
   * Create a new refund request
   */
  async createRefund(userId: string, data: CreateRefundInput) {
    // Check if the refundable item exists
    const refundable = await (this.prisma as any).refundable.findUnique({
      where: { id: data.refundableId },
    });

    if (!refundable) {
      throw new NotFoundException(`Refundable item with ID ${data.refundableId} not found`);
    }

    // Check if the quantity is valid
    if (data.quantity > refundable.quantity) {
      throw new NotFoundException(`Requested refund quantity (${data.quantity}) exceeds available quantity (${refundable.quantity})`);
    }

    // Check if the product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${data.productId} not found`);
    }

    // Create the refund request
    const refund = await (this.prisma as any).refund.create({
      data: {
        refundableId: data.refundableId,
        userId,
        productId: data.productId,
        quantity: data.quantity,
        reason: data.reason,
        description: data.description,
      },
      include: {
        refundable: {
          include: {
            user: true,
            product: true,
            order: true,
            seller: true,
            address: true,
          },
        },
        user: true,
        product: true,
      },
    });

    return refund;
  }

  /**
   * Get all refund requests with pagination and filtering
   */
  async findAllRefunds(searchInput: SearchRefundInput) {
    const { page = 1, limit = 10, userId, productId, refundableId, status, sortBy = 'createdAt', sortOrder = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where conditions
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (productId) {
      where.productId = productId;
    }

    if (refundableId) {
      where.refundableId = refundableId;
    }

    if (status) {
      where.status = status;
    }

    // Get the total count
    const totalItems = await (this.prisma as any).refund.count({ where });

    // Get the refund requests
    const refunds = await (this.prisma as any).refund.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        refundable: {
          include: {
            user: true,
            product: true,
            order: true,
            seller: true,
            address: true,
          },
        },
        user: true,
        product: true,
      },
    });

    // Return with pagination metadata
    return {
      results: refunds,
      meta: {
        totalItems,
        itemCount: refunds.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get refund requests by user ID with pagination and filtering
   */
  async findRefundsByUserId(userId: string, searchInput: SearchRefundInput) {
    // Add userId to the search input
    const updatedSearchInput = {
      ...searchInput,
      userId,
    };

    return this.findAllRefunds(updatedSearchInput);
  }

  /**
   * Get a refund request by its ID
   */
  async findRefundById(id: string) {
    const refund = await (this.prisma as any).refund.findUnique({
      where: { id },
      include: {
        refundable: {
          include: {
            user: true,
            product: true,
            order: true,
            seller: true,
            address: true,
          },
        },
        user: true,
        product: true,
      },
    });

    if (!refund) {
      throw new NotFoundException(`Refund request with ID ${id} not found`);
    }

    return refund;
  }

  /**
   * Update a refund request's status
   */
  async updateRefundStatus(data: UpdateRefundStatusInput) {
    const refund = await (this.prisma as any).refund.findUnique({
      where: { id: data.id },
    });

    if (!refund) {
      throw new NotFoundException(`Refund request with ID ${data.id} not found`);
    }

    // Update the refund status
    const updatedRefund = await (this.prisma as any).refund.update({
      where: { id: data.id },
      data: {
        status: data.status,
      },
      include: {
        refundable: {
          include: {
            user: true,
            product: true,
            order: true,
            seller: true,
            address: true,
          },
        },
        user: true,
        product: true,
      },
    });

    return updatedRefund;
  }
}