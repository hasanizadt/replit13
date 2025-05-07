import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeInput } from './dto/create-attribute.input';
import { UpdateAttributeInput } from './dto/update-attribute.input';
import { SearchAttributeInput } from './dto/search-attribute.input';
import { CreateAttributeValueInput } from './dto/create-attribute-value.input';
import { UpdateAttributeValueInput } from './dto/update-attribute-value.input';
import { SearchAttributeValueInput } from './dto/search-attribute-value.input';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new attribute
   */
  async createAttribute(data: CreateAttributeInput) {
    return this.prisma.attribute.create({
      data,
      include: {
        values: true,
      },
    });
  }

  /**
   * Get all attributes with pagination and filtering
   */
  async findAllAttributes(searchInput: SearchAttributeInput) {
    const { page, limit, search, sortBy, sortDirection } = searchInput;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } as any },
        { description: { contains: search, mode: 'insensitive' } as any },
      ];
    }
    
    // Get total count
    const totalCount = await this.prisma.attribute.count({ where });
    
    // Get attributes
    const attributes = await this.prisma.attribute.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDirection } as any,
      include: {
        values: true,
      } as any,
    });
    
    // Calculate page count
    const pageCount = Math.ceil(totalCount / limit);
    
    return {
      attributes,
      totalCount,
      page,
      pageSize: limit,
      pageCount,
    };
  }

  /**
   * Get an attribute by its ID
   */
  async findAttributeById(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id } as any,
      include: {
        values: true,
      } as any,
    });
    
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }
    
    return attribute;
  }

  /**
   * Update an attribute
   */
  async updateAttribute(data: UpdateAttributeInput) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id: data.id } as any,
    });
    
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${data.id} not found`);
    }
    
    return this.prisma.attribute.update({
      where: { id: data.id } as any,
      data,
      include: {
        values: true,
      } as any,
    });
  }

  /**
   * Delete an attribute
   */
  async deleteAttribute(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id } as any,
    });
    
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${id} not found`);
    }
    
    // Delete related attribute values first
    await this.prisma.attributeValue.deleteMany({
      where: { attributeId: id } as any,
    });
    
    // Delete the attribute
    await this.prisma.attribute.delete({
      where: { id } as any,
    });
    
    return { success: true, message: 'Attribute deleted successfully' };
  }

  /**
   * Creates a new attribute value
   */
  async createAttributeValue(data: CreateAttributeValueInput) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id: data.attributeId } as any,
    });
    
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${data.attributeId} not found`);
    }
    
    return this.prisma.attributeValue.create({
      data,
      include: {
        attribute: true,
      } as any,
    });
  }

  /**
   * Get all attribute values with pagination and filtering
   */
  async findAllAttributeValues(searchInput: SearchAttributeValueInput) {
    const { page, limit, search, attributeId, sortBy, sortDirection } = searchInput;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {};
    
    if (search) {
      where.OR = [
        { value: { contains: search, mode: 'insensitive' } as any },
      ];
    }
    
    if (attributeId) {
      where.attributeId = attributeId;
    }
    
    // Get total count
    const totalCount = await this.prisma.attributeValue.count({ where });
    
    // Get attribute values
    const attributeValues = await this.prisma.attributeValue.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortDirection } as any,
      include: {
        attribute: true,
      } as any,
    });
    
    // Calculate page count
    const pageCount = Math.ceil(totalCount / limit);
    
    return {
      attributeValues,
      totalCount,
      page,
      pageSize: limit,
      pageCount,
    };
  }

  /**
   * Get an attribute value by its ID
   */
  async findAttributeValueById(id: string) {
    const attributeValue = await this.prisma.attributeValue.findUnique({
      where: { id } as any,
      include: {
        attribute: true,
      } as any,
    });
    
    if (!attributeValue) {
      throw new NotFoundException(`Attribute value with ID ${id} not found`);
    }
    
    return attributeValue;
  }

  /**
   * Update an attribute value
   */
  async updateAttributeValue(data: UpdateAttributeValueInput) {
    const attributeValue = await this.prisma.attributeValue.findUnique({
      where: { id: data.id } as any,
    });
    
    if (!attributeValue) {
      throw new NotFoundException(`Attribute value with ID ${data.id} not found`);
    }
    
    if (data.attributeId) {
      const attribute = await this.prisma.attribute.findUnique({
        where: { id: data.attributeId } as any,
      });
      
      if (!attribute) {
        throw new NotFoundException(`Attribute with ID ${data.attributeId} not found`);
      }
    }
    
    return this.prisma.attributeValue.update({
      where: { id: data.id } as any,
      data,
      include: {
        attribute: true,
      } as any,
    });
  }

  /**
   * Delete an attribute value
   */
  async deleteAttributeValue(id: string) {
    const attributeValue = await this.prisma.attributeValue.findUnique({
      where: { id } as any,
    });
    
    if (!attributeValue) {
      throw new NotFoundException(`Attribute value with ID ${id} not found`);
    }
    
    await this.prisma.attributeValue.delete({
      where: { id } as any,
    });
    
    return { success: true, message: 'Attribute value deleted successfully' };
  }
}
