import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToWishlistInput } from './dto/add-to-wishlist.input';
import { SearchWishlistInput } from './dto/search-wishlist.input';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a product to the user's wishlist
   */
  async addToWishlist(userId: string, data: AddToWishlistInput) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId } as any,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if product is already in wishlist
    const existingItem = await this.prisma.wishlist.findFirst({
      where: {
        userId,
        productId: data.productId,
      } as any,
    });

    if (existingItem) {
      throw new BadRequestException('Product already in wishlist');
    }

    // Add product to wishlist
    return this.prisma.wishlist.create({
      data: {
        userId,
        productId: data.productId,
      } as any,
      include: {
        user: true,
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
      } as any,
    });
  }

  /**
   * Remove a product from the user's wishlist
   */
  async removeFromWishlist(userId: string, wishlistId: string) {
    // Check if wishlist item exists and belongs to the user
    const wishlistItem = await this.prisma.wishlist.findFirst({
      where: {
        id: wishlistId,
        userId,
      } as any,
    });

    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
    }

    // Remove from wishlist
    await this.prisma.wishlist.delete({
      where: { id: wishlistId } as any,
    });

    return {
      success: true,
      message: 'Item removed from wishlist',
    };
  }

  /**
   * Get user's wishlist items with pagination and filtering
   */
  async getUserWishlist(userId: string, searchInput: SearchWishlistInput) {
    const { page = 1, limit = 10, search } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where clause with type assertion for complex nested conditions
    const where = {
      userId,
      ...(search
        ? {
            product: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ] as any,
            },
          }
        : {}),
    } as any;

    // Get wishlist items
    const [results, totalItems] = await Promise.all([
      this.prisma.wishlist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' } as any,
        include: {
          user: true,
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
        } as any,
      }),
      this.prisma.wishlist.count({ where }),
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
   * Get a wishlist item by its ID
   */
  async getWishlistItemById(userId: string, wishlistId: string) {
    const wishlistItem = await this.prisma.wishlist.findFirst({
      where: {
        id: wishlistId,
        userId,
      } as any,
      include: {
        user: true,
        product: {
          include: {
            category: true,
            brand: true,
          },
        },
      } as any,
    });

    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
    }

    return wishlistItem;
  }

  /**
   * Check if a product is in the user's wishlist
   */
  async isProductInWishlist(userId: string, productId: string) {
    const wishlistItem = await this.prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      } as any,
    });

    return {
      inWishlist: !!wishlistItem,
      wishlistId: wishlistItem?.id || null,
    };
  }
}