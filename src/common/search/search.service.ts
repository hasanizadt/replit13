import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
  ) {
    this.logger.setContext('SearchService');
  }

  /**
   * Perform a full-text search for products
   */
  async searchProducts(
    query: string,
    options: {
      categories?: string[];
      brands?: string[];
      minPrice?: number;
      maxPrice?: number;
      attributes?: Record<string, string[]>;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {},
  ) {
    const {
      categories = [],
      brands = [],
      minPrice,
      maxPrice,
      attributes = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = options;

    const cacheKey = `search:products:${query}:${JSON.stringify(options)}`;
    
    // Try to get results from cache first
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          // Create filters
          const filters: any = {
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },

              ],
            },
          };

          // Add category filter if provided
          if (categories.length > 0) {
            filters.where.AND = filters.where.AND || [];
            filters.where.AND.push({
              OR: [
                { categoryId: { in: categories } },

              ],
            });
          }

          // Add brand filter if provided
          if (brands.length > 0) {
            filters.where.AND = filters.where.AND || [];
            filters.where.AND.push({ brandId: { in: brands } });
          }

          // Add price range filter if provided
          if (minPrice !== undefined || maxPrice !== undefined) {
            filters.where.AND = filters.where.AND || [];
            const priceFilter: any = {};
            
            if (minPrice !== undefined) {
              priceFilter.gte = minPrice;
            }
            
            if (maxPrice !== undefined) {
              priceFilter.lte = maxPrice;
            }
            
            filters.where.AND.push({ price: priceFilter });
          }

          // Add attribute filters if provided
          if (Object.keys(attributes).length > 0) {
            for (const [attributeId, values] of Object.entries(attributes)) {
              filters.where.AND = filters.where.AND || [];
              filters.where.AND.push({
                productAttributes: {
                  some: {
                    attributeId,
                    attributeValueId: { in: values },
                  },
                },
              });
            }
          }

          // Set up pagination
          const skip = (page - 1) * limit;
          const take = limit;

          // Set up sorting
          const orderBy: any = {};
          orderBy[sortBy] = sortOrder;

          // Execute search query with filters, sorting, and pagination
          const [products, totalCount] = await Promise.all([
            this.prisma.product.findMany({
              ...filters,
              orderBy,
              skip,
              take,
              include: {
                category: true,
                brand: true,
                productAttributes: {
                  include: {
                    attribute: true,
                    attributeValue: true,
                  },
                },

              },
            }),
            this.prisma.product.count(filters),
          ]);

          return {
            products,
            meta: {
              currentPage: page,
              itemsPerPage: limit,
              totalItems: totalCount,
              totalPages: Math.ceil(totalCount / limit),
              sortBy,
              sortOrder,
            },
          };
        } catch (error) {
          this.logger.error(`Error during product search: ${error.message}`, error.stack);
          throw error;
        }
      },
      3600, // Cache for 1 hour
    );
  }

  /**
   * Generate product recommendations based on user behavior and product similarities
   */
  async getRecommendedProducts(
    userId: string,
    productId?: string,
    limit: number = 10,
  ) {
    const cacheKey = `recommendations:${userId}:${productId || 'homepage'}:${limit}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          // If a product ID is provided, find similar products
          if (productId) {
            // Get the current product details
            const currentProduct = await this.prisma.product.findUnique({
              where: { id: productId },
              include: {
                category: true,
                brand: true,
              },
            });

            if (!currentProduct) {
              return { products: [] };
            }

            // Find similar products based on category, brand, and tags
            const similarProducts = await this.prisma.product.findMany({
              where: {
                id: { not: productId }, // Exclude the current product
                AND: [
                  {
                    OR: [
                      { categoryId: currentProduct.categoryId },
                      { brandId: currentProduct.brandId },
                    ],
                  },
                ],
              },
              include: {
                category: true,
                brand: true,
              },
              take: limit,
            });

            return { products: similarProducts };
          }
          
          // If no product ID, find recommendations based on user's browsing history
          // Get user's order history
          const userOrders = await this.prisma.order.findMany({
            where: {
              userId,
            },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5, // Consider last 5 orders
          });
          
          // Get user's cart
          const userCart = await this.prisma.cart.findMany({
            where: {
              userId,
            },
            include: {
              product: true,
            },
          });
          
          // Collect category IDs, brand IDs from user's purchases and cart
          const categoryIds = new Set<string>();
          const brandIds = new Set<string>();
          const purchasedProductIds = new Set<string>();
          
          // Add categories and brands from orders
          userOrders.forEach(order => {
            order.items.forEach(item => {
              if (item.product) {
                categoryIds.add(item.product.categoryId);
                if (item.product.brandId) {
                  brandIds.add(item.product.brandId);
                }
                purchasedProductIds.add(item.productId);
              }
            });
          });
          
          // Add categories and brands from cart
          userCart.forEach(item => {
            if (item.product) {
              categoryIds.add(item.product.categoryId);
              if (item.product.brandId) {
                brandIds.add(item.product.brandId);
              }
              purchasedProductIds.add(item.productId);
            }
          });
          
          // Find recommended products based on user's interests
          const recommendedProducts = await this.prisma.product.findMany({
            where: {
              id: { notIn: Array.from(purchasedProductIds) }, // Exclude already purchased products
              OR: [
                { categoryId: { in: Array.from(categoryIds) } },
                { brandId: { in: Array.from(brandIds) } },
              ],
            },
            include: {
              category: true,
              brand: true,
            },
            take: limit,
          });
          
          return { products: recommendedProducts };
        } catch (error) {
          this.logger.error(`Error getting recommended products: ${error.message}`, error.stack);
          throw error;
        }
      },
      1800, // Cache for 30 minutes
    );
  }

  /**
   * Get trending products based on recent orders and views
   */
  async getTrendingProducts(limit: number = 10) {
    const cacheKey = `trending:products:${limit}`;
    
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        try {
          // Get date for the last 7 days
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          
          // Find products ordered in the last 7 days and count them
          const popularProducts = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
              order: {
                createdAt: {
                  gte: lastWeek,
                },
              },
            },
            _count: {
              productId: true,
            },
            orderBy: {
              _count: {
                productId: 'desc',
              },
            },
            take: limit,
          });
          
          // Get the full product details
          const productIds = popularProducts.map(p => p.productId);
          
          const trendingProducts = await this.prisma.product.findMany({
            where: {
              id: { in: productIds },
            },
            include: {
              category: true,
              brand: true,
            },
          });
          
          // Sort the products by their popularity
          const sortedProducts = trendingProducts.sort((a, b) => {
            const aCount = popularProducts.find(p => p.productId === a.id)?._count.productId || 0;
            const bCount = popularProducts.find(p => p.productId === b.id)?._count.productId || 0;
            return bCount - aCount;
          });
          
          return { products: sortedProducts };
        } catch (error) {
          this.logger.error(`Error getting trending products: ${error.message}`, error.stack);
          throw error;
        }
      },
      7200, // Cache for 2 hours
    );
  }
}
