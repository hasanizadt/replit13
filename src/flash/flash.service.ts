import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlashInput } from './dto/create-flash.input';
import { UpdateFlashInput } from './dto/update-flash.input';
import { SearchFlashInput } from './dto/search-flash.input';
import { OrderByInput } from '../common/dto/order-by.input';
import { generateSlug } from '../config/app.config';

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
export class FlashService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new flash sale
   */
  async createFlash(data: CreateFlashInput) {
    const { productIds, ...flashData } = data;

    // Validate dates
    if (flashData.endDate < flashData.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Generate slug from title
    const slug = generateSlug(flashData.title);

    // Check if flash sale with same slug already exists
    const existingFlash = await (this.prisma as any).flash.findUnique({
      where: { slug },
    });

    if (existingFlash) {
      throw new ConflictException('Flash sale with this title already exists');
    }

    // Create flash sale
    const flash = await (this.prisma as any).flash.create({
      data: {
        title: flashData.title,
        slug,
        startDate: flashData.startDate,
        endDate: flashData.endDate,
        // Required fields for product model that might not exist in flash model
        name: flashData.title as any, // Product requires name
        price: 0 as any, // Product requires price
        ...(productIds && productIds.length > 0
          ? {
              products: {
                connect: productIds.map((id) => ({ id })),
              } as any
            }
          : {}),
      } as any,
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            images: true,
          }
        } as any,
      } as any,
    });

    return flash;
  }

  /**
   * Get all flash sales with pagination and filtering
   */
  async findAllFlashes(searchInput: SearchFlashInput) {
    const { page = 1, limit = 10, search, active, sortBy = 'createdAt', sortDirection = 'desc', orderBy } = searchInput;
    const skip = (page - 1) * limit;
    const now = new Date();

    // Build the where clause
    const where = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(active !== undefined
        ? active
          ? {
              startDate: { lte: now },
              endDate: { gte: now },
            }
          : {
              OR: [
                { startDate: { gt: now } },
                { endDate: { lt: now } },
              ],
            }
        : {}),
    };

    // Get flash sales with pagination
    const [results, totalItems] = await Promise.all([
      (this.prisma as any).flash.findMany({
        where,
        include: {
          products: true,
        },
        skip,
        take: limit,
        orderBy: getOrderByClause(orderBy, sortBy, sortDirection),
      }),
      (this.prisma as any).flash.count({ where }),
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
   * Get active flash sales
   */
  async getActiveFlashes() {
    const now = new Date();
    
    return (this.prisma as any).flash.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        products: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  /**
   * Get a flash sale by its ID
   */
  async findFlashById(id: string) {
    const flash = await (this.prisma as any).flash.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!flash) {
      throw new NotFoundException('Flash sale not found');
    }

    return flash;
  }

  /**
   * Get a flash sale by its slug
   */
  async findFlashBySlug(slug: string) {
    const flash = await (this.prisma as any).flash.findUnique({
      where: { slug },
      include: {
        products: true,
      },
    });

    if (!flash) {
      throw new NotFoundException('Flash sale not found');
    }

    return flash;
  }

  /**
   * Update a flash sale
   */
  async updateFlash(data: UpdateFlashInput) {
    const { id, productIds, ...updateData } = data;

    // Check if flash sale exists
    const flash = await (this.prisma as any).flash.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!flash) {
      throw new NotFoundException('Flash sale not found');
    }

    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate && updateData.endDate < updateData.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Validate start date against existing end date
    if (updateData.startDate && flash.endDate && updateData.startDate > flash.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate end date against existing start date
    if (updateData.endDate && flash.startDate && updateData.endDate < flash.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Generate slug if title is provided
    const updatePayload: any = { ...updateData };
    if (updateData.title) {
      const slug = generateSlug(updateData.title);
      
      // Check if slug already exists for another flash sale
      const existingFlash = await (this.prisma as any).flash.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (existingFlash) {
        throw new ConflictException('Flash sale with this title already exists');
      }

      updatePayload.slug = slug;
    }

    // Update flash sale
    return (this.prisma as any).flash.update({
      where: { id },
      data: {
        ...updatePayload,
        ...(productIds
          ? {
              products: {
                set: productIds.map((productId) => ({ id: productId })),
              },
            }
          : {}),
      },
      include: {
        products: true,
      },
    });
  }

  /**
   * Add products to a flash sale
   */
  async addProductsToFlash(flashId: string, productIds: string[]) {
    // Check if flash sale exists
    const flash = await (this.prisma as any).flash.findUnique({
      where: { id: flashId },
      include: {
        products: {
          select: { id: true },
        },
      },
    });

    if (!flash) {
      throw new NotFoundException('Flash sale not found');
    }

    // Get existing product IDs
    const existingProductIds = flash.products.map((product) => product.id);
    
    // Filter out product IDs that are already in the flash sale
    const newProductIds = productIds.filter((id) => !existingProductIds.includes(id));

    if (newProductIds.length === 0) {
      return flash;
    }

    // Add products to flash sale
    return (this.prisma as any).flash.update({
      where: { id: flashId },
      data: {
        products: {
          connect: newProductIds.map((id) => ({ id })),
        },
      },
      include: {
        products: true,
      },
    });
  }

  /**
   * Remove products from a flash sale
   */
  async removeProductsFromFlash(flashId: string, productIds: string[]) {
    // Check if flash sale exists
    const flash = await (this.prisma as any).flash.findUnique({
      where: { id: flashId },
    });

    if (!flash) {
      throw new NotFoundException('Flash sale not found');
    }

    // Remove products from flash sale
    return (this.prisma as any).flash.update({
      where: { id: flashId },
      data: {
        products: {
          disconnect: productIds.map((id) => ({ id })),
        },
      },
      include: {
        products: true,
      },
    });
  }

  /**
   * Delete a flash sale
   */
  async deleteFlash(id: string) {
    // Check if flash sale exists
    const flash = await (this.prisma as any).flash.findUnique({
      where: { id },
    });

    if (!flash) {
      throw new NotFoundException('Flash sale not found');
    }

    // Delete flash sale
    await (this.prisma as any).flash.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Flash sale deleted successfully',
    };
  }
}