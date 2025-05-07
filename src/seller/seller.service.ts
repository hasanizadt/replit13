import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSellerInput } from './dto/create-seller.input';
import { UpdateSellerInput } from './dto/update-seller.input';
import { CreateBankInput } from './dto/create-bank.input';
import { UpdateBankInput } from './dto/update-bank.input';
import { SearchSellerInput } from './dto/search-seller.input';

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new seller account
   */
  async createSeller(userId: string, data: CreateSellerInput) {
    // Check if seller with this phone already exists
    const existingSeller = await this.prisma.seller.findUnique({
      where: { phone: data.phone } as any,
    });

    if (existingSeller) {
      throw new Error(`Seller with phone ${data.phone} already exists`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Create the seller account
    const seller = await this.prisma.seller.create({
      data: {
        shopName: data.shopName,
        phone: data.phone,
        logo: data.logo,
        banner: data.banner,
        address: data.address,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        userId,
      },
      include: {
        user: true,
      } as any,
    });

    // Update user role to SELLER if not already an admin
    if (user.role !== 'ADMIN') {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: 'SELLER' },
      });
    }

    return seller;
  }

  /**
   * Get all sellers with pagination and filtering
   */
  async findAllSellers(searchInput: SearchSellerInput) {
    const { page = 1, limit = 10, userId, shopName, phone, isVerified, isBanned, sortBy = 'createdAt', sortOrder = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where conditions
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (shopName) {
      where.shopName = {
        contains: shopName,
        mode: 'insensitive',
      };
    }

    if (phone) {
      where.phone = phone;
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    if (isBanned !== undefined) {
      where.isBanned = isBanned;
    }

    // Get the total count
    const totalItems = await this.prisma.seller.count({ where });

    // Get the sellers
    const sellers = await this.prisma.seller.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: true,
        bank: true as any,
        products: {
          take: 5,
        },
      } as any,
    });

    // Return with pagination metadata
    return {
      results: sellers,
      meta: {
        totalItems,
        itemCount: sellers.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get a seller by its ID
   */
  async findSellerById(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
      include: {
        user: true,
        products: {
          take: 10,
        },
      } as any,
    });

    if (!seller) {
      throw new NotFoundException(`Seller with ID ${id} not found`);
    }

    return seller;
  }

  /**
   * Get a seller by user ID
   */
  async findSellerByUserId(userId: string) {
    const seller = await this.prisma.seller.findFirst({
      where: { userId },
      include: {
        user: true,
        products: {
          take: 10,
        },
      } as any,
    });

    if (!seller) {
      throw new NotFoundException(`Seller with user ID ${userId} not found`);
    }

    return seller;
  }

  /**
   * Update a seller
   */
  async updateSeller(data: UpdateSellerInput) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: data.id },
    });

    if (!seller) {
      throw new NotFoundException(`Seller with ID ${data.id} not found`);
    }

    // Check phone uniqueness if updating phone
    if (data.phone && data.phone !== seller.phone) {
      const existingSeller = await this.prisma.seller.findFirst({
        where: { phone: data.phone },
      });

      if (existingSeller && existingSeller.id !== data.id) {
        throw new Error(`Seller with phone ${data.phone} already exists`);
      }
    }

    // Update the seller
    const updatedSeller = await this.prisma.seller.update({
      where: { id: data.id },
      data: {
        shopName: data.shopName,
        phone: data.phone,
        logo: data.logo,
        banner: data.banner,
        address: data.address,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        isVerified: data.isVerified,
        isBanned: data.isBanned,
      },
      include: {
        user: true,
      } as any,
    });

    return updatedSeller;
  }

  /**
   * Delete a seller
   */
  async deleteSeller(id: string) {
    const seller = await this.prisma.seller.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!seller) {
      throw new NotFoundException(`Seller with ID ${id} not found`);
    }

    // Delete the seller
    await this.prisma.seller.delete({
      where: { id },
    });

    // Revert user role if not ADMIN
    if (seller.user.role !== 'ADMIN') {
      await this.prisma.user.update({
        where: { id: seller.userId },
        data: { role: 'USER' },
      });
    }

    return { success: true, message: 'Seller deleted successfully' };
  }

  /**
   * Create a bank account for a seller
   */
  async createBank(sellerId: string, data: CreateBankInput) {
    // Check if seller exists
    const seller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new NotFoundException(`Seller with ID ${sellerId} not found`);
    }

    // Check if seller already has a bank account
    const existingBank = await (this.prisma as any).bank.findUnique({
      where: { sellerId },
    });

    if (existingBank) {
      throw new Error(`Seller with ID ${sellerId} already has a bank account`);
    }

    // Create the bank account
    const bank = await (this.prisma as any).bank.create({
      data: {
        bankName: data.bankName,
        accountTitle: data.accountTitle,
        accountNumber: data.accountNumber,
        routingNumber: data.routingNumber,
        sellerId,
      },
      include: {
        seller: true,
      },
    });

    return bank;
  }

  /**
   * Update a bank account
   */
  async updateBank(data: UpdateBankInput) {
    const bank = await (this.prisma as any).bank.findUnique({
      where: { id: data.id },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${data.id} not found`);
    }

    // Update the bank account
    const updatedBank = await (this.prisma as any).bank.update({
      where: { id: data.id },
      data: {
        bankName: data.bankName,
        accountTitle: data.accountTitle,
        accountNumber: data.accountNumber,
        routingNumber: data.routingNumber,
      },
      include: {
        seller: true,
      },
    });

    return updatedBank;
  }

  /**
   * Get bank account by seller ID
   */
  async findBankBySellerId(sellerId: string) {
    const bank = await (this.prisma as any).bank.findUnique({
      where: { sellerId },
      include: {
        seller: true,
      },
    });

    if (!bank) {
      throw new NotFoundException(`Bank account for seller with ID ${sellerId} not found`);
    }

    return bank;
  }
  
  /**
   * Get bank account by ID
   */
  async findBankById(id: string) {
    const bank = await (this.prisma as any).bank.findUnique({
      where: { id },
      include: {
        seller: true,
      },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    return bank;
  }

  /**
   * Delete a bank account
   */
  async deleteBank(id: string) {
    const bank = await (this.prisma as any).bank.findUnique({
      where: { id },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    // Delete the bank account
    await (this.prisma as any).bank.delete({
      where: { id },
    });

    return { success: true, message: 'Bank account deleted successfully' };
  }
}