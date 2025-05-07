import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { SearchTagInput } from './dto/search-tag.input';
import { generateSlug } from '../config/app.config';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new tag
   */
  async createTag(data: CreateTagInput) {
    // Generate slug from name
    const slug = generateSlug(data.name);

    // Check if tag with same name or slug already exists
    const existingTag = await (this.prisma as any).tag.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug },
        ],
      },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    // Create tag
    return (this.prisma as any).tag.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  /**
   * Get all tags with pagination and filtering
   */
  async findAllTags(searchInput: SearchTagInput) {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortDirection = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where clause
    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Get tags with pagination
    const [results, totalItems] = await Promise.all([
      (this.prisma as any).tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortDirection },
      }),
      (this.prisma as any).tag.count({ where }),
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
   * Get a tag by its ID
   */
  async findTagById(id: string) {
    const tag = await (this.prisma as any).tag.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  /**
   * Get a tag by its slug
   */
  async findTagBySlug(slug: string) {
    const tag = await (this.prisma as any).tag.findUnique({
      where: { slug },
      include: {
        products: true,
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  /**
   * Update a tag
   */
  async updateTag(data: UpdateTagInput) {
    const { id, ...updateData } = data;

    // Check if tag exists
    const tag = await (this.prisma as any).tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Generate slug if name is provided
    const updatePayload: any = { ...updateData };
    if (updateData.name) {
      const slug = generateSlug(updateData.name);

      // Check if slug already exists for another tag
      const existingTag = await (this.prisma as any).tag.findFirst({
        where: {
          OR: [
            {
              name: updateData.name,
              id: { not: id },
            },
            {
              slug,
              id: { not: id },
            },
          ],
        },
      });

      if (existingTag) {
        throw new ConflictException('Tag with this name already exists');
      }

      updatePayload.slug = slug;
    }

    // Update tag
    return (this.prisma as any).tag.update({
      where: { id },
      data: updatePayload,
    });
  }

  /**
   * Delete a tag
   */
  async deleteTag(id: string) {
    // Check if tag exists
    const tag = await (this.prisma as any).tag.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check if tag has products
    if (tag.products.length > 0) {
      throw new ConflictException('Cannot delete tag with associated products');
    }

    // Delete tag
    await (this.prisma as any).tag.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Tag deleted successfully',
    };
  }
}