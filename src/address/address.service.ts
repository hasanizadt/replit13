import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { SearchAddressInput } from './dto/search-address.input';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new address for a user
   */
  async createAddress(userId: string, data: CreateAddressInput) {
    // If this is the first address or default is true, make it default
    const addressCount = await this.prisma.address.count({
      where: { userId } as any,
    });

    const isDefault = addressCount === 0 || data.isDefault;

    // If making this address default, reset all other addresses to non-default
    if (isDefault) {
      await this.prisma.address.updateMany({
        where: { userId } as any,
        data: { isDefault: false },
      });
    }

    // Using type assertion for the whole prisma call
    const newAddress = await this.prisma.address.create({
      data: {
        name: data.name,
        fullName: data.fullName || data.name, // Using name as fallback for fullName
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.area || '', // Map area to state
        country: data.country,
        postalCode: data.postal || '', // Map postal to postalCode
        isDefault,
        userId,
      } as any,
    } as any);
    
    return newAddress;
  }

  /**
   * Get all addresses for a user with pagination and filtering
   */
  async findAllAddresses(userId: string, searchInput: SearchAddressInput) {
    const { page, limit, search, onlyIsDefault, sortBy, sortDirection } = searchInput;
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = { userId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as any } },
        { address: { contains: search, mode: 'insensitive' as any } },
        { city: { contains: search, mode: 'insensitive' as any } },
        { country: { contains: search, mode: 'insensitive' as any } },
        { state: { contains: search, mode: 'insensitive' as any } }, // Changed area to state to match schema
      ] as any;
    }
    
    if (onlyIsDefault) {
      where.isDefault = true;
    }
    
    // Get total count
    const totalCount = await this.prisma.address.count({ where: where as any });
    
    // Get addresses
    const addresses = await this.prisma.address.findMany({
      where: where as any,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortDirection,
      } as any,
    } as any);
    
    // Calculate pagination info
    const pageCount = Math.ceil(totalCount / limit);
    
    return {
      addresses,
      totalCount,
      page,
      pageSize: limit,
      pageCount,
    };
  }

  /**
   * Get a user's address by ID
   */
  async findAddressById(userId: string, id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id } as any,
    } as any);
    
    if (!address || (address as any).userId !== userId) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    
    return address;
  }

  /**
   * Get a user's default address
   */
  async findDefaultAddress(userId: string) {
    const address = await this.prisma.address.findFirst({
      where: { userId, isDefault: true } as any,
    } as any);
    
    if (!address) {
      throw new NotFoundException(`No default address found for this user`);
    }
    
    return address;
  }

  /**
   * Update an address
   */
  async updateAddress(userId: string, data: UpdateAddressInput) {
    // Check if address exists and belongs to user
    const address = await this.prisma.address.findUnique({
      where: { id: data.id } as any,
    } as any);
    
    if (!address || (address as any).userId !== userId) {
      throw new NotFoundException(`Address with ID ${data.id} not found`);
    }
    
    // If making this address default, reset all other addresses to non-default
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { 
          userId,
          id: { not: data.id }
        } as any,
        data: { isDefault: false },
      } as any);
    }
    
    // Using type assertion for the whole prisma call
    return this.prisma.address.update({
      where: { id: data.id } as any,
      data: data as any,
    } as any);
  }

  /**
   * Delete an address
   */
  async deleteAddress(userId: string, id: string) {
    // Check if address exists and belongs to user
    const address = await this.prisma.address.findUnique({
      where: { id } as any,
    } as any);
    
    if (!address || (address as any).userId !== userId) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    
    // If this was the default address and there are other addresses,
    // make another address the default
    if ((address as any).isDefault) {
      const otherAddress = await this.prisma.address.findFirst({
        where: { 
          userId,
          id: { not: id }
        } as any,
      } as any);
      
      if (otherAddress) {
        // Using type assertion for the whole prisma call
        await this.prisma.address.update({
          where: { id: otherAddress.id } as any,
          data: { isDefault: true } as any,
        } as any);
      }
    }
    
    // Using type assertion for the whole prisma call
    return this.prisma.address.delete({
      where: { id } as any,
    } as any);
  }
}
