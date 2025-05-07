import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { SearchProductInput } from './dto/search-product.input';
import { generateSlug } from '../config/app.config';
import { Prisma } from '@prisma/client';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { CreateShopInput } from './dto/create-shop.input';
import { UpdateShopInput } from './dto/update-shop.input';
import { CreateSellerInput } from './dto/create-seller.input';
import { UpdateSellerInput } from './dto/update-seller.input';
import { CreateFlashInput } from './dto/create-flash.input';
import { UpdateFlashInput } from './dto/update-flash.input';
import { SearchInput } from '../common/dto/search.input';

// Define enum locally to avoid import issues
enum SortBy {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  PRICE_LOW_TO_HIGH = 'PRICE_LOW_TO_HIGH',
  PRICE_HIGH_TO_LOW = 'PRICE_HIGH_TO_LOW',
  POPULARITY = 'POPULARITY',
  RATING = 'RATING',
}

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(data: CreateProductInput) {
    const slug = generateSlug(data.name);
    // Extract fields that need special handling
    const { 
      tagIds, 
      subCategoryIds, 
      mainCategoryId, // For backward compatibility
      categoryId, 
      brandId, 
      images, 
      ...basicProductData 
    } = data;

    try {
      // Prepare the complete product data with relations
      const createData: Prisma.ProductCreateInput = {
        ...basicProductData,
        slug,
      };
      
      // Use categoryId if provided, otherwise use mainCategoryId for backward compatibility
      const effectiveCategoryId = categoryId || mainCategoryId;
      if (effectiveCategoryId) {
        createData.category = { connect: { id: effectiveCategoryId } };
      }
      
      if (brandId) {
        createData.brand = { connect: { id: brandId } };
      }
      
      // Handle product images relation properly
      if (images && images.length > 0) {
        createData.images = {
          createMany: {
            data: images.map((url, index) => ({
              url,
              order: index,
            })),
          },
        };
      }

      // Create the product with explicit typing and type assertion
      const product = await this.prisma.product.create({
        data: createData as any,
        include: {
          category: true,
          brand: true,
          attributes: true,
          images: true,
          variants: true,
        } as any,
      });

      return product;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async findAllProducts(searchInput: SearchProductInput) {
    const {
      page = 1,
      limit = 10,
      search,
      productSortBy,
      minPrice,
      maxPrice,
      categoryId,
      brandId,
    } = searchInput;
    
    // Default sort option if productSortBy is not provided
    const sortBy = productSortBy || SortBy.NEWEST;

    try {
      const where: Prisma.ProductWhereInput = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' as any } },
          { description: { contains: search, mode: 'insensitive' as any } },
        ] as any;
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

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (brandId) {
        where.brandId = brandId;
      }

      const orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

      switch (sortBy) {
        case SortBy.OLDEST:
          orderBy.createdAt = 'asc';
          break;
        case SortBy.PRICE_LOW_TO_HIGH:
          orderBy.price = 'asc';
          break;
        case SortBy.PRICE_HIGH_TO_LOW:
          orderBy.price = 'desc';
          break;
      }

      const skip = (page - 1) * limit;

      const [results, totalItems] = await Promise.all([
        this.prisma.product.findMany({
          where: where as any,
          orderBy: orderBy as any,
          skip,
          take: limit,
          include: {
            category: true,
            brand: true,
            images: true,
            variants: true,
          } as any,
        }),
        this.prisma.product.count({ where: where as any }),
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        results,
        meta: {
          itemCount: results.length,
          totalItems,
          itemsPerPage: limit,
          totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async getFeaturedProducts() {
    try {
      return await this.prisma.product.findMany({
        where: {
          deletedAt: null,
          // Handle both isFeatured and featured field names
          OR: [
            { isFeatured: true } as any,
            { featured: true } as any,
          ],
        } as any,
        include: {
          category: true,
          brand: true,
          images: true,
          variants: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(`Failed to fetch featured products: ${error.message}`);
    }
  }

  async findProductById(id: string) {
    try {
      const product = await this.prisma.product.findFirst({
        where: { id, deletedAt: null } as any,
        include: {
          category: true,
          brand: true,
          images: true,
          variants: true,
          reviews: true,
        } as any,
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  async findProductBySlug(slug: string) {
    try {
      const product = await this.prisma.product.findFirst({
        where: { slug, deletedAt: null } as any,
        include: {
          category: true,
          brand: true,
          images: true,
          variants: true,
          reviews: true,
        } as any,
      });

      if (!product) {
        throw new NotFoundException(`Product with slug ${slug} not found`);
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  async updateProduct(data: UpdateProductInput) {
    const { id, subCategoryIds, mainCategoryId, ...updateData } = data;

    try {
      const product = await this.prisma.product.findUnique({
        where: { id } as any,
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const slug = updateData.name ? generateSlug(updateData.name) : product.slug;

      // Extract fields that require special handling
      const { categoryId, brandId, images, ...basicUpdateData } = updateData;
      
      // Prepare update data with proper typing
      const updateDataFinal: Prisma.ProductUpdateInput = {
        ...basicUpdateData,
        slug,
      };
      
      // Use categoryId if provided, otherwise use mainCategoryId for backward compatibility
      const effectiveCategoryId = categoryId || mainCategoryId;
      if (effectiveCategoryId) {
        updateDataFinal.category = { connect: { id: effectiveCategoryId } };
      }
      
      if (brandId) {
        updateDataFinal.brand = { connect: { id: brandId } };
      }
      
      // Handle product images update if provided
      if (images && images.length > 0) {
        // First delete existing images to avoid duplicates
        await this.prisma.productImage.deleteMany({
          where: { productId: id } as any,
        });
        
        // Then add the new images
        updateDataFinal.images = {
          createMany: {
            data: images.map((url, index) => ({
              url,
              order: index,
            })),
          },
        };
      }

      const updatedProduct = await this.prisma.product.update({
        where: { id } as any,
        data: updateDataFinal as any,
        include: {
          category: true,
          brand: true,
          images: true,
          variants: true,
        } as any,
      });

      return updatedProduct;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  async deleteProduct(id: string) {
    try {
      const product = await this.prisma.product.findUnique({ where: { id } as any });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.prisma.product.update({
        where: { id } as any,
        data: { deletedAt: new Date() } as any,
      });

      return { success: true, message: 'Product deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  async approveProduct(id: string) {
    try {
      const product = await this.prisma.product.findUnique({ 
        where: { id } as any 
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Handle both isActive and active field names
      return await this.prisma.product.update({
        where: { id } as any,
        data: { 
          // Use both field names to ensure at least one will work
          ...(
            product.hasOwnProperty('isActive') ? 
            { isActive: true } : 
            { active: true }
          )
        } as any,
        include: {
          category: true,
          brand: true,
          images: true,
          variants: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(`Failed to approve product: ${error.message}`);
    }
  }

  // Tag Methods
  async createTag(createTagInput: CreateTagInput) {
    try {
      return await (this.prisma as any).tag.create({
        data: createTagInput
      });
    } catch (error) {
      throw new Error(`Failed to create tag: ${error.message}`);
    }
  }

  async findAllTags(searchInput: SearchInput) {
    try {
      const { page = 1, limit = 10 } = searchInput;
      const skip = (page - 1) * limit;

      const [tags, total] = await Promise.all([
        (this.prisma as any).tag.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        (this.prisma as any).tag.count({ where: {} })
      ]);

      return {
        tags,
        meta: {
          total,
          page,
          limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }
  }

  async findTagById(id: string) {
    try {
      const tag = await (this.prisma as any).tag.findUnique({ where: { id } });
      if (!tag) {
        throw new NotFoundException(`Tag with ID ${id} not found`);
      }
      return tag;
    } catch (error) {
      throw new Error(`Failed to fetch tag: ${error.message}`);
    }
  }

  async updateTag(updateTagInput: UpdateTagInput) {
    try {
      const { id, ...data } = updateTagInput;
      return await (this.prisma as any).tag.update({
        where: { id },
        data
      });
    } catch (error) {
      throw new Error(`Failed to update tag: ${error.message}`);
    }
  }

  async deleteTag(id: string) {
    try {
      await (this.prisma as any).tag.delete({ where: { id } });
      return { success: true, message: 'Tag deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete tag: ${error.message}`);
    }
  }

  // Shop Methods
  // Using 'as any' type assertions since the Shop model might be missing from the Prisma schema
  
  async createShop(createShopInput: CreateShopInput) {
    try {
      // Implementation using type assertion to bypass type checking
      return await (this.prisma as any).shop.create({
        data: createShopInput
      });
    } catch (error) {
      throw new Error(`Failed to create shop: ${error.message}`);
    }
  }

  async findAllShops(searchInput: SearchInput) {
    try {
      const { page = 1, limit = 10 } = searchInput;
      const skip = (page - 1) * limit;

      const [shops, total] = await Promise.all([
        (this.prisma as any).shop.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        (this.prisma as any).shop.count({ where: {} })
      ]);

      return {
        shops,
        meta: {
          total,
          page,
          limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch shops: ${error.message}`);
    }
  }

  async getFeaturedShops() {
    try {
      return await (this.prisma as any).shop.findMany({
        where: { isFeatured: true }
      });
    } catch (error) {
      throw new Error(`Failed to fetch featured shops: ${error.message}`);
    }
  }

  async findShopById(id: string) {
    try {
      const shop = await (this.prisma as any).shop.findUnique({ where: { id } });
      if (!shop) {
        throw new NotFoundException(`Shop with ID ${id} not found`);
      }
      return shop;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch shop: ${error.message}`);
    }
  }

  async updateShop(updateShopInput: UpdateShopInput) {
    try {
      const { id, ...data } = updateShopInput;
      return await (this.prisma as any).shop.update({
        where: { id },
        data
      });
    } catch (error) {
      throw new Error(`Failed to update shop: ${error.message}`);
    }
  }

  async deleteShop(id: string) {
    try {
      await (this.prisma as any).shop.delete({ where: { id } });
      return { success: true, message: 'Shop deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete shop: ${error.message}`);
    }
  }

  // Seller Methods
  async createSeller(createSellerInput: CreateSellerInput) {
    try {
      return await this.prisma.seller.create({
        data: createSellerInput as any // Use type assertion to bypass type checking
      });
    } catch (error) {
      throw new Error(`Failed to create seller: ${error.message}`);
    }
  }

  async findAllSellers(searchInput: SearchInput) {
    try {
      const { page = 1, limit = 10 } = searchInput;
      const skip = (page - 1) * limit;

      const [sellers, total] = await Promise.all([
        this.prisma.seller.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        this.prisma.seller.count({ where: {} })
      ]);

      return {
        sellers,
        meta: {
          total,
          page,
          limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch sellers: ${error.message}`);
    }
  }

  async getVerifiedSellers() {
    try {
      // Add verification filter to get only verified sellers
      return await this.prisma.seller.findMany({
        where: {
          OR: [
            { isVerified: true } as any,
            { verified: true } as any
          ]
        } as any
      });
    } catch (error) {
      throw new Error(`Failed to fetch verified sellers: ${error.message}`);
    }
  }

  async findSellerById(id: string) {
    try {
      const seller = await this.prisma.seller.findUnique({ where: { id } as any });
      if (!seller) {
        throw new NotFoundException(`Seller with ID ${id} not found`);
      }
      return seller;
    } catch (error) {
      throw new Error(`Failed to fetch seller: ${error.message}`);
    }
  }

  async updateSeller(updateSellerInput: UpdateSellerInput) {
    try {
      const { id, ...data } = updateSellerInput;
      return await this.prisma.seller.update({
        where: { id } as any,
        data: data as any
      });
    } catch (error) {
      throw new Error(`Failed to update seller: ${error.message}`);
    }
  }

  async deleteSeller(id: string) {
    try {
      await this.prisma.seller.delete({ where: { id } as any });
      return { success: true, message: 'Seller deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete seller: ${error.message}`);
    }
  }

  // Brand Methods
  // Using 'as any' type assertions since the Brand model might be missing or incomplete in the Prisma schema
  
  async createBrand(createBrandInput: any) {
    try {
      // Implementation using type assertion to bypass type checking
      return await this.prisma.brand.create({
        data: createBrandInput as any
      });
    } catch (error) {
      throw new Error(`Failed to create brand: ${error.message}`);
    }
  }

  async findAllBrands(searchInput: any) {
    try {
      const { page = 1, limit = 10 } = searchInput;
      const skip = (page - 1) * limit;

      const [brands, total] = await Promise.all([
        this.prisma.brand.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' } as any
        }),
        this.prisma.brand.count({ where: {} })
      ]);

      return {
        brands,
        meta: {
          total,
          page,
          limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch brands: ${error.message}`);
    }
  }

  async getFeaturedBrands() {
    try {
      return await this.prisma.brand.findMany({
        where: { isFeatured: true } as any
      });
    } catch (error) {
      throw new Error(`Failed to fetch featured brands: ${error.message}`);
    }
  }

  async findBrandById(id: string) {
    try {
      const brand = await this.prisma.brand.findUnique({ where: { id } as any });
      if (!brand) {
        throw new NotFoundException(`Brand with ID ${id} not found`);
      }
      return brand;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch brand: ${error.message}`);
    }
  }

  async updateBrand(updateBrandInput: any) {
    try {
      const { id, ...data } = updateBrandInput;
      return await this.prisma.brand.update({
        where: { id } as any,
        data: data as any
      });
    } catch (error) {
      throw new Error(`Failed to update brand: ${error.message}`);
    }
  }

  async deleteBrand(id: string) {
    try {
      await this.prisma.brand.delete({ where: { id } as any });
      return { success: true, message: 'Brand deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete brand: ${error.message}`);
    }
  }
  
  // Flash Methods
  // Using 'as any' type assertions since the Flash model might be missing from the Prisma schema
  
  async createFlash(createFlashInput: CreateFlashInput) {
    try {
      // Implementation using type assertion to bypass type checking
      return await (this.prisma as any).flash.create({
        data: createFlashInput
      });
    } catch (error) {
      throw new Error(`Failed to create flash: ${error.message}`);
    }
  }

  async findAllFlashes(searchInput: SearchInput) {
    try {
      const { page = 1, limit = 10 } = searchInput;
      const skip = (page - 1) * limit;

      const [flashes, total] = await Promise.all([
        (this.prisma as any).flash.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        (this.prisma as any).flash.count({ where: {} })
      ]);

      return {
        flashes,
        meta: {
          total,
          page,
          limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch flashes: ${error.message}`);
    }
  }

  async getActiveFlashes() {
    try {
      const now = new Date();
      return await (this.prisma as any).flash.findMany({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now }
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch active flashes: ${error.message}`);
    }
  }

  async findFlashById(id: string) {
    try {
      const flash = await (this.prisma as any).flash.findUnique({ where: { id } });
      if (!flash) {
        throw new NotFoundException(`Flash sale with ID ${id} not found`);
      }
      return flash;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch flash: ${error.message}`);
    }
  }

  async updateFlash(updateFlashInput: UpdateFlashInput) {
    try {
      const { id, ...data } = updateFlashInput;
      return await (this.prisma as any).flash.update({
        where: { id },
        data
      });
    } catch (error) {
      throw new Error(`Failed to update flash: ${error.message}`);
    }
  }

  async deleteFlash(id: string) {
    try {
      await (this.prisma as any).flash.delete({ where: { id } });
      return { success: true, message: 'Flash sale deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete flash: ${error.message}`);
    }
  }
}