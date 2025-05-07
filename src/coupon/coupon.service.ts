import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PointsService } from '../points/points.service';
import { PointTransactionType } from '../points/models/point.model';
import { CreateCouponInput } from './dto/create-coupon.input';
import { UpdateCouponInput } from './dto/update-coupon.input';
import { SearchCouponInput } from './dto/search-coupon.input';
import { VerifyCouponInput } from './dto/verify-coupon.input';
import { CreateCouponUserInput } from './dto/create-coupon-user.input';
import { SearchCouponUserInput } from './dto/search-coupon-user.input';
import { DiscountUnit } from './models/discount-unit.enum';

@Injectable()
export class CouponService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsService: PointsService
  ) {}

  /**
   * Creates a new coupon
   */
  async createCoupon(userId: string, data: CreateCouponInput) {
    // Check if coupon with same code already exists
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new ConflictException('Coupon with this code already exists');
    }

    // Validate discount based on discount unit
    if (data.discountUnit === DiscountUnit.PERCENT && data.discount > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Create coupon
    return this.prisma.coupon.create({
      data: {
        ...data,
        createdBy: userId,
      },
      include: {
        user: true,
        usedCoupons: true,
      },
    });
  }

  /**
   * Get all coupons with pagination and filtering
   */
  async findAllCoupons(searchInput: SearchCouponInput) {
    const { page = 1, limit = 10, search, active, sortBy = 'createdAt', sortDirection = 'desc' } = searchInput;
    const skip = (page - 1) * limit;
    const now = new Date();

    // Build the where clause with type assertions
    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } as any },
              { code: { contains: search, mode: 'insensitive' } as any },
            ],
          }
        : {}),
      ...(active !== undefined
        ? active
          ? {
              expiresAt: { gte: now } as any,
            }
          : {
              expiresAt: { lt: now } as any,
            }
        : {}),
    } as any;

    // Get coupons with pagination
    const [results, totalItems] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        include: {
          user: true,
          usedCoupons: true,
        } as any,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortDirection } as any,
      }),
      this.prisma.coupon.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);

    return {
      results,
      meta: {
        totalItems,
        itemCount: results.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  /**
   * Get a coupon by its ID
   */
  async findCouponById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id } as any,
      include: {
        user: true,
        usedCoupons: true,
      } as any,
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  /**
   * Get a coupon by its code
   */
  async findCouponByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code } as any,
      include: {
        user: true,
        usedCoupons: true,
      } as any,
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  /**
   * Update a coupon
   */
  async updateCoupon(data: UpdateCouponInput) {
    const { id, ...updateData } = data;

    // Check if coupon exists
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Check if code is being updated and if it's already in use
    if (updateData.code && updateData.code !== coupon.code) {
      const existingCoupon = await this.prisma.coupon.findUnique({
        where: { code: updateData.code },
      });

      if (existingCoupon) {
        throw new ConflictException('Coupon with this code already exists');
      }
    }

    // Validate discount based on discount unit
    if (
      (updateData.discountUnit === DiscountUnit.PERCENT && updateData.discount && updateData.discount > 100) ||
      (coupon.discountUnit === 'PERCENT' && updateData.discount && updateData.discount > 100)
    ) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Update coupon
    return this.prisma.coupon.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        usedCoupons: true,
      },
    });
  }

  /**
   * Delete a coupon
   */
  async deleteCoupon(id: string) {
    // Check if coupon exists
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
      include: {
        usedCoupons: true,
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Delete coupon
    await this.prisma.coupon.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Coupon deleted successfully',
    };
  }

  /**
   * Verify a coupon and calculate discount
   */
  async verifyCoupon(userId: string, data: VerifyCouponInput) {
    const { code, cartTotal } = data;

    // Find coupon by code
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
      include: {
        usedCoupons: {
          where: {
            userId,
            used: true,
          },
        },
      },
    });

    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid coupon code',
      };
    }

    // Check if coupon is expired
    if (coupon.expiresAt < new Date()) {
      return {
        valid: false,
        message: 'Coupon has expired',
      };
    }

    // Check if coupon has minimum purchase requirement
    if (coupon.minimumPurchase && cartTotal < coupon.minimumPurchase) {
      return {
        valid: false,
        message: `Minimum purchase of ${coupon.minimumPurchase} required`,
      };
    }

    // Check if user has already used this coupon
    if (coupon.usedCoupons.length > 0) {
      return {
        valid: false,
        message: 'You have already used this coupon',
      };
    }

    // Calculate discount
    let discount = 0;

    if (coupon.discountUnit === 'PERCENT') {
      discount = (cartTotal * coupon.discount) / 100;
    } else {
      discount = coupon.discount;
    }

    return {
      valid: true,
      coupon,
      discount,
    };
  }

  /**
   * Apply a coupon to a user's order
   */
  async applyCoupon(userId: string, couponId: string) {
    // Check if coupon exists
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
      include: {
        usedCoupons: {
          where: {
            userId,
            used: true,
          },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Check if coupon is expired
    if (coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check if user has already used this coupon
    if (coupon.usedCoupons.length > 0) {
      throw new BadRequestException('You have already used this coupon');
    }

    // Create used coupon record
    return this.prisma.usedCoupon.create({
      data: {
        couponId,
        userId,
        used: true,
      },
      include: {
        coupon: true,
        user: true,
      },
    });
  }

  /**
   * Creates a new user-specific coupon (from points)
   */
  async createCouponUser(data: CreateCouponUserInput) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId } as any,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user points from transactions instead of user.points
    const pointTransactions = await (this.prisma as any).pointTransaction.findMany({
      where: { 
        userId: data.userId,
        active: true,
      },
    });
    
    // Calculate available points from transactions
    let userPoints = 0;
    pointTransactions.forEach(transaction => {
      if (transaction.type === PointTransactionType.EARNED || transaction.type === PointTransactionType.ADJUSTED) {
        userPoints += transaction.points;
      } else if (transaction.type === PointTransactionType.REDEEMED) {
        userPoints -= transaction.points;
      }
    });
    
    if (userPoints < data.points) {
      throw new BadRequestException('Not enough points');
    }

    // Check if code already exists
    const existingCoupon = await this.prisma.couponUser.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new ConflictException('Coupon with this code already exists');
    }

    // Validate discount based on discount unit
    if (data.discountUnit === DiscountUnit.PERCENT && data.discount > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Create transaction to create coupon and deduct points
    const coupon = await this.prisma.$transaction(async (prisma) => {
      // Create coupon
      const newCoupon = await prisma.couponUser.create({
        data: {
          ...data,
        },
        include: {
          user: true,
        } as any,
      });

      // Use PointsService to create the point transaction
      await this.pointsService.createPointTransaction({
        userId: data.userId,
        points: -data.points, // Negative points for redemption
        type: PointTransactionType.REDEEMED, 
        description: `Points redeemed for coupon: ${data.code}`,
        active: true,
      });

      return newCoupon;
    });

    return coupon;
  }

  /**
   * Get all user coupons with pagination and filtering
   */
  async findAllCouponUsers(searchInput: SearchCouponUserInput) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      userId, 
      used, 
      sortBy = 'createdAt', 
      sortDirection = 'desc' 
    } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where clause with type assertions
    const where = {
      ...(search
        ? {
            code: { contains: search, mode: 'insensitive' } as any,
          }
        : {}),
      ...(userId ? { userId } : {}),
      ...(used !== undefined
        ? used
          ? { usedAt: { not: null } as any }
          : { usedAt: null }
        : {}),
    } as any;

    // Get user coupons with pagination
    const [results, totalItems] = await Promise.all([
      this.prisma.couponUser.findMany({
        where,
        include: {
          user: true,
        } as any,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortDirection } as any,
      }),
      this.prisma.couponUser.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);

    return {
      results,
      meta: {
        totalItems,
        itemCount: results.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  /**
   * Get a user coupon by its ID
   */
  async findCouponUserById(id: string) {
    const coupon = await this.prisma.couponUser.findUnique({
      where: { id } as any,
      include: {
        user: true,
      } as any,
    });

    if (!coupon) {
      throw new NotFoundException('User coupon not found');
    }

    return coupon;
  }

  /**
   * Get a user coupon by its code
   */
  async findCouponUserByCode(code: string) {
    const coupon = await this.prisma.couponUser.findUnique({
      where: { code } as any,
      include: {
        user: true,
      } as any,
    });

    if (!coupon) {
      throw new NotFoundException('User coupon not found');
    }

    return coupon;
  }

  /**
   * Verify a user-specific coupon
   */
  async verifyUserCoupon(userId: string, code: string, cartTotal: number) {
    // Find coupon by code
    const coupon = await this.prisma.couponUser.findUnique({
      where: { code } as any,
    });

    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid coupon code',
      };
    }

    // Check if coupon belongs to user
    if (coupon.userId !== userId) {
      return {
        valid: false,
        message: 'This coupon belongs to another user',
      };
    }

    // Check if coupon is already used
    if (coupon.usedAt) {
      return {
        valid: false,
        message: 'This coupon has already been used',
      };
    }

    // Calculate discount
    let discount = 0;

    if (coupon.discountUnit === 'PERCENT') {
      discount = (cartTotal * coupon.discount) / 100;
    } else {
      discount = coupon.discount;
    }

    return {
      valid: true,
      coupon,
      discount,
    };
  }

  /**
   * Apply a user-specific coupon
   */
  async applyUserCoupon(userId: string, couponCode: string) {
    // Find coupon by code
    const coupon = await this.prisma.couponUser.findUnique({
      where: { code: couponCode } as any,
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    // Check if coupon belongs to user
    if (coupon.userId !== userId) {
      throw new BadRequestException('This coupon belongs to another user');
    }

    // Check if coupon is already used
    if (coupon.usedAt) {
      throw new BadRequestException('This coupon has already been used');
    }

    // Mark coupon as used
    return this.prisma.couponUser.update({
      where: { id: coupon.id } as any,
      data: {
        usedAt: new Date(),
      },
      include: {
        user: true,
      } as any,
    });
  }
}