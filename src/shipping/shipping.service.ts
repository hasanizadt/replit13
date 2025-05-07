import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingZoneInput } from './dto/create-shipping-zone.input';
import { UpdateShippingZoneInput } from './dto/update-shipping-zone.input';
import { SearchShippingZoneInput } from './dto/search-shipping-zone.input';
import { CreateShippingMethodInput } from './dto/create-shipping-method.input';
import { UpdateShippingMethodInput } from './dto/update-shipping-method.input';
import { SearchShippingMethodInput } from './dto/search-shipping-method.input';

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new shipping zone
   */
  async createShippingZone(data: CreateShippingZoneInput) {
    return (this.prisma as any).shippingZone.create({
      data,
      include: {
        shippingMethods: true,
      },
    });
  }

  /**
   * Get all shipping zones with pagination and filtering
   */
  async findAllShippingZones(searchInput: SearchShippingZoneInput) {
    const { page, limit, search, country, isActive, sortBy, sortDirection } = searchInput;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (country) {
      where.countries = {
        has: country,
      };
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    // Get total count
    const totalCount = await (this.prisma as any).shippingZone.count({ where });
    
    // Get shipping zones
    const shippingZones = await (this.prisma as any).shippingZone.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDirection },
      include: {
        shippingMethods: true,
      },
    });
    
    // Calculate page count
    const pageCount = Math.ceil(totalCount / limit);
    
    return {
      shippingZones,
      totalCount,
      page,
      pageSize: limit,
      pageCount,
    };
  }

  /**
   * Get a shipping zone by ID
   */
  async findShippingZoneById(id: string) {
    const shippingZone = await (this.prisma as any).shippingZone.findUnique({
      where: { id },
      include: {
        shippingMethods: true,
      },
    });
    
    if (!shippingZone) {
      throw new NotFoundException(`Shipping zone with ID ${id} not found`);
    }
    
    return shippingZone;
  }

  /**
   * Update a shipping zone
   */
  async updateShippingZone(data: UpdateShippingZoneInput) {
    const shippingZone = await (this.prisma as any).shippingZone.findUnique({
      where: { id: data.id },
    });
    
    if (!shippingZone) {
      throw new NotFoundException(`Shipping zone with ID ${data.id} not found`);
    }
    
    return (this.prisma as any).shippingZone.update({
      where: { id: data.id },
      data,
      include: {
        shippingMethods: true,
      },
    });
  }

  /**
   * Delete a shipping zone
   */
  async deleteShippingZone(id: string) {
    const shippingZone = await (this.prisma as any).shippingZone.findUnique({
      where: { id },
      include: {
        shippingMethods: true,
      },
    });
    
    if (!shippingZone) {
      throw new NotFoundException(`Shipping zone with ID ${id} not found`);
    }
    
    // Delete associated shipping methods first
    if (shippingZone.shippingMethods.length > 0) {
      await (this.prisma as any).shippingMethod.deleteMany({
        where: { shippingZoneId: id },
      });
    }
    
    // Delete the shipping zone
    await (this.prisma as any).shippingZone.delete({
      where: { id },
    });
    
    return { success: true, message: 'Shipping zone deleted successfully' };
  }

  /**
   * Creates a new shipping method
   */
  async createShippingMethod(data: CreateShippingMethodInput) {
    // Verify shipping zone exists
    const shippingZone = await (this.prisma as any).shippingZone.findUnique({
      where: { id: data.shippingZoneId },
    });
    
    if (!shippingZone) {
      throw new NotFoundException(`Shipping zone with ID ${data.shippingZoneId} not found`);
    }
    
    // Validate price range if both min and max are provided
    if (data.minimumOrderAmount !== undefined && data.maximumOrderAmount !== undefined) {
      if (data.minimumOrderAmount > data.maximumOrderAmount) {
        throw new BadRequestException('Minimum order amount cannot be greater than maximum order amount');
      }
    }
    
    return (this.prisma as any).shippingMethod.create({
      data,
      include: {
        shippingZone: true,
      },
    });
  }

  /**
   * Get all shipping methods with pagination and filtering
   */
  async findAllShippingMethods(searchInput: SearchShippingMethodInput) {
    const { page, limit, search, shippingZoneId, minPrice, maxPrice, isActive, sortBy, sortDirection } = searchInput;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (shippingZoneId) {
      where.shippingZoneId = shippingZoneId;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    // Get total count
    const totalCount = await (this.prisma as any).shippingMethod.count({ where });
    
    // Get shipping methods
    const shippingMethods = await (this.prisma as any).shippingMethod.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDirection },
      include: {
        shippingZone: true,
      },
    });
    
    // Calculate page count
    const pageCount = Math.ceil(totalCount / limit);
    
    return {
      shippingMethods,
      totalCount,
      page,
      pageSize: limit,
      pageCount,
    };
  }

  /**
   * Get a shipping method by ID
   */
  async findShippingMethodById(id: string) {
    const shippingMethod = await (this.prisma as any).shippingMethod.findUnique({
      where: { id },
      include: {
        shippingZone: true,
      },
    });
    
    if (!shippingMethod) {
      throw new NotFoundException(`Shipping method with ID ${id} not found`);
    }
    
    return shippingMethod;
  }

  /**
   * Update a shipping method
   */
  async updateShippingMethod(data: UpdateShippingMethodInput) {
    const shippingMethod = await (this.prisma as any).shippingMethod.findUnique({
      where: { id: data.id },
      include: {
        shippingZone: true,
      },
    });
    
    if (!shippingMethod) {
      throw new NotFoundException(`Shipping method with ID ${data.id} not found`);
    }
    
    // If shipping zone ID is being updated, verify the new zone exists
    if (data.shippingZoneId && data.shippingZoneId !== shippingMethod.shippingZoneId) {
      const shippingZone = await (this.prisma as any).shippingZone.findUnique({
        where: { id: data.shippingZoneId },
      });
      
      if (!shippingZone) {
        throw new NotFoundException(`Shipping zone with ID ${data.shippingZoneId} not found`);
      }
    }
    
    // Validate price range if both min and max are provided or updated
    let minAmount = shippingMethod.minimumOrderAmount;
    let maxAmount = shippingMethod.maximumOrderAmount;
    
    if (data.minimumOrderAmount !== undefined) {
      minAmount = data.minimumOrderAmount;
    }
    
    if (data.maximumOrderAmount !== undefined) {
      maxAmount = data.maximumOrderAmount;
    }
    
    if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
      throw new BadRequestException('Minimum order amount cannot be greater than maximum order amount');
    }
    
    return (this.prisma as any).shippingMethod.update({
      where: { id: data.id },
      data,
      include: {
        shippingZone: true,
      },
    });
  }

  /**
   * Delete a shipping method
   */
  async deleteShippingMethod(id: string) {
    const shippingMethod = await (this.prisma as any).shippingMethod.findUnique({
      where: { id },
    });
    
    if (!shippingMethod) {
      throw new NotFoundException(`Shipping method with ID ${id} not found`);
    }
    
    await (this.prisma as any).shippingMethod.delete({
      where: { id },
    });
    
    return { success: true, message: 'Shipping method deleted successfully' };
  }

  /**
   * Get applicable shipping methods for a location
   */
  async getShippingMethodsForLocation(country: string, state?: string, city?: string, zipCode?: string, orderAmount?: number) {
    // Find eligible shipping zones
    const shippingZones = await (this.prisma as any).shippingZone.findMany({
      where: {
        isActive: true,
        countries: {
          has: country,
        },
        OR: [
          { states: null },
          { states: { isEmpty: true } },
          { states: { has: state } },
        ],
        AND: [
          {
            OR: [
              { cities: null },
              { cities: { isEmpty: true } },
              { cities: { has: city } },
            ],
          },
          {
            OR: [
              { zipCodes: null },
              { zipCodes: { isEmpty: true } },
              { zipCodes: { has: zipCode } },
            ],
          },
        ],
      },
      include: {
        shippingMethods: {
          where: {
            isActive: true,
          },
        },
      },
    });
    
    // Extract all shipping methods from the eligible zones
    let eligibleMethods = [];
    
    shippingZones.forEach(zone => {
      zone.shippingMethods.forEach(method => {
        // Check order amount constraints if provided
        if (orderAmount !== undefined) {
          const minAmount = method.minimumOrderAmount || 0;
          const maxAmount = method.maximumOrderAmount || Number.MAX_SAFE_INTEGER;
          
          if (orderAmount >= minAmount && orderAmount <= maxAmount) {
            eligibleMethods.push({
              ...method,
              shippingZone: zone,
            });
          }
        } else {
          eligibleMethods.push({
            ...method,
            shippingZone: zone,
          });
        }
      });
    });
    
    // Sort by price (lowest first)
    eligibleMethods.sort((a, b) => a.price - b.price);
    
    return eligibleMethods;
  }
}
