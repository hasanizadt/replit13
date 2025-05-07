import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandInput } from './dto/create-brand.input';
import { UpdateBrandInput } from './dto/update-brand.input';
import { SearchBrandInput } from './dto/search-brand.input';
import { generateSlug } from '../config/app.config';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  async createBrand(data: CreateBrandInput) {
    const slug = generateSlug(data.name);

    // Check if a brand with the same name or slug already exists
    const existingBrand = await this.prisma.brand.findFirst({
      where: {
        OR: [
          { name: { equals: data.name, mode: 'insensitive' as any } },
          { slug: { equals: slug, mode: 'insensitive' as any } },
        ] as any,
      },
    });

    if (existingBrand) {
      throw new ConflictException('Brand with this name already exists');
    }

    return this.prisma.brand.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        logo: data.logo || null,
        website: data.website || null,
        featured: data.isFeatured ?? false, // Changed isFeatured to featured to match schema
        // createdAt and updatedAt are automatically handled by Prisma
      },
      include: {
        products: true,
      },
    });
  }

  async findAllBrands(searchInput: SearchBrandInput) {
    const { page = 1, limit = 10, search, isFeatured, sortBy = 'createdAt', sortDirection = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Define the where condition for the query
    const where: any = {}; // Use any type to avoid TypeScript errors
    
    // Add search conditions if search parameter is provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as any } },
        { description: { contains: search, mode: 'insensitive' as any } },
      ];
    }
    
    // Add featured filter if isFeatured parameter is provided
    if (isFeatured !== undefined) {
      where.featured = isFeatured;
    }

    const [results, totalItems] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortDirection },
        include: {
          products: true,
        },
      }),
      this.prisma.brand.count({ where }),
    ]);

    return {
      results,
      meta: {
        totalItems,
        itemCount: results.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  async getFeaturedBrands() {
    return this.prisma.brand.findMany({
      where: {
        featured: true, // Changed from isFeatured to featured to match schema
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        products: true,
      },
    });
  }

  async findBrandById(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async findBrandBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        products: true,
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async updateBrand(data: UpdateBrandInput) {
    const { id, ...updateData } = data;

    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const updatePayload: any = { ...updateData };
    if (updateData.name) {
      const slug = generateSlug(updateData.name);

      // Find any existing brand with the same name or slug
      const existingBrand = await this.prisma.brand.findFirst({
        where: {
          OR: [
            {
              name: { equals: updateData.name, mode: 'insensitive' as any },
              id: { not: id },
            },
            {
              slug: { equals: slug, mode: 'insensitive' as any },
              id: { not: id },
            },
          ] as any,
        },
      });

      if (existingBrand) {
        throw new ConflictException('Brand with this name already exists');
      }

      updatePayload.slug = slug;
    }

    return this.prisma.brand.update({
      where: { id },
      data: updatePayload,
      include: {
        products: true,
      },
    });
  }

  async deleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (brand.products.length > 0) {
      throw new ConflictException('Cannot delete brand with associated products');
    }

    await this.prisma.brand.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Brand deleted successfully',
    };
  }
}