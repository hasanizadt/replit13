import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePointTransactionInput } from './dto/create-point-transaction.input';
import { UpdatePointTransactionInput } from './dto/update-point-transaction.input';
import { SearchPointTransactionInput } from './dto/search-point-transaction.input';
import { RedeemPointsInput } from './dto/redeem-points.input';
import { PointTransactionType } from './models/point.model';
import { OrderByInput } from '../common/dto/order-by.input';

// Helper function to get the order by clause based on different input formats
function getOrderByClause(orderByInput?: OrderByInput | any, sortBy = 'createdAt', sortDirection = 'desc'): any {
  // New format with OrderByInput object
  if (orderByInput && typeof orderByInput === 'object' && orderByInput.field) {
    return { [orderByInput.field]: orderByInput.direction };
  }
  
  // Legacy string format (can also accept just a field name)
  if (sortBy && typeof sortBy === 'string') {
    return { [sortBy]: sortDirection };
  }
  
  // Default sorting
  return { createdAt: 'desc' };
}

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a point transaction
   */
  async createPointTransaction(data: CreatePointTransactionInput) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    
    if (!user) {
      throw new NotFoundException(`User not found with ID ${data.userId}`);
    }
    
    // If order is provided, verify it exists
    if (data.orderId) {
      const order = await this.prisma.order.findUnique({
        where: { id: data.orderId },
      });
      
      if (!order) {
        throw new NotFoundException(`Order not found with ID ${data.orderId}`);
      }
    }
    
    // Create the point transaction
    return this.prisma.pointTransaction.create({
      data,
      include: {
        user: true,
      },
    });
  }

  /**
   * Get point transactions with pagination and filtering
   */
  async findAllPointTransactions(searchInput: SearchPointTransactionInput) {
    const { page, limit, userId, orderId, type, startDate, endDate, active, sortBy, sortDirection, orderBy } = searchInput;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (orderId) {
      where.orderId = orderId;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }
    
    if (active !== undefined) {
      where.active = active;
    }
    
    // Get total count
    const totalCount = await this.prisma.pointTransaction.count({ where });
    
    // Get transactions
    const transactions = await this.prisma.pointTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: getOrderByClause(orderBy, sortBy, sortDirection),
      include: {
        user: true,
      },
    });
    
    // Calculate page count
    const pageCount = Math.ceil(totalCount / limit);
    
    return {
      transactions,
      totalCount,
      page,
      pageSize: limit,
      pageCount,
    };
  }

  /**
   * Get a point transaction by ID
   */
  async findPointTransactionById(id: string) {
    const transaction = await this.prisma.pointTransaction.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
    
    if (!transaction) {
      throw new NotFoundException(`Point transaction not found with ID ${id}`);
    }
    
    return transaction;
  }

  /**
   * Update a point transaction
   */
  async updatePointTransaction(data: UpdatePointTransactionInput) {
    const transaction = await this.prisma.pointTransaction.findUnique({
      where: { id: data.id },
    });
    
    if (!transaction) {
      throw new NotFoundException(`Point transaction not found with ID ${data.id}`);
    }
    
    return this.prisma.pointTransaction.update({
      where: { id: data.id },
      data,
      include: {
        user: true,
      },
    });
  }

  /**
   * Delete a point transaction
   */
  async deletePointTransaction(id: string) {
    const transaction = await this.prisma.pointTransaction.findUnique({
      where: { id },
    });
    
    if (!transaction) {
      throw new NotFoundException(`Point transaction not found with ID ${id}`);
    }
    
    await this.prisma.pointTransaction.delete({
      where: { id },
    });
    
    return { success: true, message: 'Point transaction deleted successfully' };
  }

  /**
   * Get user's point balance
   */
  async getUserPointBalance(userId: string) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException(`User not found with ID ${userId}`);
    }
    
    // Get all active transactions for this user
    const transactions = await this.prisma.pointTransaction.findMany({
      where: { 
        userId,
        active: true,
        OR: [
          { expiresAt: { gt: new Date() } } as any,
          { expiresAt: null } as any,
        ] as any,
      } as any,
    });
    
    // Get expired transactions
    const expiredTransactions = await this.prisma.pointTransaction.findMany({
      where: { 
        userId,
        expiresAt: { lte: new Date() } as any,
        active: true,
      } as any,
    });
    
    // If there are expired transactions, deactivate them
    if (expiredTransactions.length > 0) {
      await this.prisma.pointTransaction.updateMany({
        where: { 
          id: { in: expiredTransactions.map(t => t.id) },
        },
        data: { 
          active: false,
          type: PointTransactionType.EXPIRED,
        },
      });
    }
    
    // Calculate totals
    let totalPoints = 0;
    let availablePoints = 0;
    let pendingPoints = 0;
    let expiredPoints = 0;
    let redeemedPoints = 0;
    let monetaryValue = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === PointTransactionType.EARNED) {
        totalPoints += transaction.points;
        availablePoints += transaction.points;
        monetaryValue += (transaction as any).monetaryValue || 0;
      } else if (transaction.type === PointTransactionType.REDEEMED) {
        redeemedPoints += transaction.points;
        availablePoints -= transaction.points;
      } else if (transaction.type === PointTransactionType.ADJUSTED) {
        totalPoints += transaction.points;
        availablePoints += transaction.points;
        monetaryValue += (transaction as any).monetaryValue || 0;
      }
    });
    
    expiredTransactions.forEach(transaction => {
      if (transaction.type === PointTransactionType.EARNED || transaction.type === PointTransactionType.ADJUSTED) {
        expiredPoints += transaction.points;
      }
    });
    
    return {
      totalPoints,
      availablePoints: availablePoints > 0 ? availablePoints : 0,
      pendingPoints,
      expiredPoints,
      redeemedPoints,
      monetaryValue,
    };
  }

  /**
   * Redeem points from a user's balance
   */
  async redeemPoints(userId: string, data: RedeemPointsInput) {
    // Get user's point balance
    const balance = await this.getUserPointBalance(userId);
    
    // Check if user has enough points
    if (balance.availablePoints < data.points) {
      throw new BadRequestException(`You don't have enough points to redeem. Available: ${balance.availablePoints}, Requested: ${data.points}`);
    }
    
    // Create the redemption transaction
    return this.createPointTransaction({
      userId,
      orderId: data.orderId,
      points: data.points,
      monetaryValue: (balance.monetaryValue / balance.totalPoints) * data.points,
      type: PointTransactionType.REDEEMED,
      description: data.description || 'Points redeemed',
      active: true,
    } as any);
  }

  /**
   * Award points to a user
   */
  async awardPoints(userId: string, points: number, orderId?: string, description?: string, expiresAt?: Date) {
    // Calculate monetary value (example: 1 point = $0.01)
    const monetaryValue = points * 0.01;
    
    // Create the points transaction
    return this.createPointTransaction({
      userId,
      orderId,
      points,
      monetaryValue,
      type: PointTransactionType.EARNED,
      description: description || 'Points earned',
      expiresAt: expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default expiry: 1 year
      active: true,
    } as any);
  }
}
