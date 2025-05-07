import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateMainCategoryInput } from './dto/create-main-category.input';
import { UpdateMainCategoryInput } from './dto/update-main-category.input';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { CreateSubCategoryInput } from './dto/create-sub-category.input';
import { UpdateSubCategoryInput } from './dto/update-sub-category.input';
import { generateSlug } from '../config/app.config';
import { SearchInput } from '../shared/dto/search.input';
import { OrderByInput } from '../common/dto/order-by.input';

/**
 * Helper function to create the orderBy clause for Prisma queries
 * Handles both the new OrderByInput format and legacy string format
 */
function getOrderByClause(orderByInput?: OrderByInput | any, sortBy = 'createdAt', sortDirection = 'desc'): any {
  // New format with OrderByInput object
  if (orderByInput && typeof orderByInput === 'object' && orderByInput.field) {
    return { [orderByInput.field]: orderByInput.direction };
  }
  
  // Legacy string format (can also accept just a field name)
  if (orderByInput && typeof orderByInput === 'string') {
    return { [orderByInput]: 'asc' };
  }
  
  // Default sorting
  return { [sortBy]: sortDirection };
}

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new main category
   */
  async createMainCategory(data: CreateMainCategoryInput) {
    const slug = data.slug || generateSlug(data.name);
    const { 
      name,
      description, 
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords
    } = data;
    
    // Create the proper Prisma data structure
    const createData: Prisma.CategoryCreateInput = {
      name,
      slug,
      description,
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
      // Main categories have no parent
      parent: undefined
    };
    
    return this.prisma.category.create({
      data: createData,
      include: {
        subcategories: {
          take: 5,
        },
      },
    });
  }

  /**
   * Get all main categories with pagination and filtering
   */
  async findAllMainCategories(searchInput: SearchInput) {
    const { search, orderBy, limit = 10, page = 1, sortBy = 'createdAt', sortDirection = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Create the where condition for search
    let whereCondition: any = {
      parentId: null, // Main categories have no parent
    };

    if (search) {
      whereCondition = {
        ...whereCondition,
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { slug: { contains: search, mode: 'insensitive' as any } },
        ],
      };
    }

    // Handle orderBy (new format) or fallback to sortBy/sortDirection (old format)
    let orderByClause: any = { [sortBy]: sortDirection };
    if (orderBy && orderBy.field) {
      orderByClause = { [orderBy.field]: orderBy.direction };
    }

    const [results, totalItems] = await Promise.all([
      this.prisma.category.findMany({
        where: whereCondition as any,
        orderBy: orderByClause,
        take: limit,
        skip,
        include: {
          subcategories: {
            take: 5,
          },
        } as any,
      }),
      this.prisma.category.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      results,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        itemCount: results.length,
      },
    };
  }

  /**
   * Get featured main categories
   */
  async getFeaturedMainCategories() {
    return this.prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      } as any,
      include: {
        subcategories: {
          take: 5,
        },
      },
    });
  }

  /**
   * Get a main category by its ID
   */
  async findMainCategoryById(id: string) {
    return this.prisma.category.findUnique({
      where: { id } as any,
      include: {
        subcategories: {
          include: {
            subcategories: true,
          },
        },
      },
    });
  }
  
  /**
   * Get a main category by its slug
   */
  async findMainCategoryBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug } as any,
      include: {
        subcategories: {
          include: {
            subcategories: true,
          },
        },
      },
    });
  }

  /**
   * Update a main category
   */
  async updateMainCategory(data: UpdateMainCategoryInput) {
    const { 
      id, 
      name,
      slug,
      description,
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords
    } = data;
    
    // Generate slug if name is provided but slug isn't
    const finalSlug = name && !slug ? generateSlug(name) : slug;

    // Create the proper Prisma data structure
    const updateData: Prisma.CategoryUpdateInput = {
      name,
      // Only include slug if we have one (either provided or generated)
      ...(finalSlug ? { slug: finalSlug } : {}),
      description,
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
      // Ensure parent is disconnected for main categories
      parent: {
        disconnect: true
      }
    };

    return this.prisma.category.update({
      where: { id } as any,
      data: updateData,
      include: {
        subcategories: {
          take: 5,
        },
      },
    });
  }

  /**
   * Delete a main category
   */
  async deleteMainCategory(id: string) {
    await this.prisma.category.delete({
      where: { id } as any,
    });

    return {
      success: true,
      message: 'Main category deleted successfully',
    };
  }

  /**
   * Creates a new category
   */
  async createCategory(data: CreateCategoryInput) {
    const slug = data.slug || generateSlug(data.name);

    // Create a structure that matches our new schema
    // Note: parentId might come from the UI as "mainCategoryId" in the older version
    const { 
      mainCategoryId, 
      parentId: explicitParentId, 
      name,
      description, 
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords
    } = data;
    
    // Use parentId explicitly provided, or fall back to mainCategoryId for backward compatibility
    const parentId = explicitParentId || mainCategoryId;

    // Create the proper Prisma data structure
    const createData: Prisma.CategoryCreateInput = {
      name,
      slug,
      description,
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
      // If we have a parentId, use the connect syntax
      ...(parentId ? {
        parent: {
          connect: { id: parentId }
        }
      } : {})
    };

    return this.prisma.category.create({
      data: createData,
      include: {
        parent: true,
        subcategories: true,
      },
    });
  }

  /**
   * Get all categories with pagination and filtering
   */
  async findAllCategories(searchInput: SearchInput) {
    const { search, orderBy, limit = 10, page = 1, sortBy = 'createdAt', sortDirection = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Create the where condition for search
    let whereCondition: any = {};

    if (search) {
      whereCondition = {
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { slug: { contains: search, mode: 'insensitive' as any } },
        ],
      };
    }

    // Handle orderBy (new format) or fallback to sortBy/sortDirection (old format)
    let orderByClause: any = { [sortBy]: sortDirection };
    if (orderBy && orderBy.field) {
      orderByClause = { [orderBy.field]: orderBy.direction };
    }

    const [results, totalItems] = await Promise.all([
      this.prisma.category.findMany({
        where: whereCondition,
        orderBy: orderByClause,
        take: limit,
        skip,
        include: {
          parent: true,
          subcategories: {
            take: 5,
          },
        },
      }),
      this.prisma.category.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      results,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        itemCount: results.length,
      },
    };
  }

  /**
   * Get categories by main category ID
   */
  async getCategoriesByMainCategoryId(mainCategoryId: string, searchInput: SearchInput) {
    const { search, orderBy, limit = 10, page = 1, sortBy = 'createdAt', sortDirection = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Create the where condition - find categories with parent ID matching the provided mainCategoryId
    let whereCondition: any = {
      parentId: mainCategoryId,
    };

    // Add search conditions if search is provided
    if (search) {
      whereCondition = {
        ...whereCondition,
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { slug: { contains: search, mode: 'insensitive' as any } },
        ],
      };
    }

    // Handle orderBy (new format) or fallback to sortBy/sortDirection (old format)
    let orderByClause: any = { [sortBy]: sortDirection };
    if (orderBy && orderBy.field) {
      orderByClause = { [orderBy.field]: orderBy.direction };
    }

    const [results, totalItems] = await Promise.all([
      this.prisma.category.findMany({
        where: whereCondition,
        orderBy: orderByClause,
        take: limit,
        skip,
        include: {
          parent: true,
          subcategories: {
            take: 5,
          },
        },
      }),
      this.prisma.category.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      results,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        itemCount: results.length,
      },
    };
  }

  /**
   * Get featured categories
   */
  async getFeaturedCategories() {
    return this.prisma.category.findMany({
      where: {
        isActive: true,
        // We focus on categories that are not main categories (have a parent)
        parentId: { not: null },
      } as any,
      include: {
        parent: true,
        subcategories: {
          take: 5,
        },
      },
    });
  }

  /**
   * Get a category by its ID
   */
  async findCategoryById(id: string) {
    return this.prisma.category.findUnique({
      where: { id } as any,
      include: {
        parent: true,
        subcategories: true,
      },
    });
  }
  
  /**
   * Get a category by its slug
   */
  async findCategoryBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug } as any,
      include: {
        parent: true,
        subcategories: true,
      },
    });
  }

  /**
   * Update a category
   */
  async updateCategory(data: UpdateCategoryInput) {
    const { 
      id, 
      name,
      slug,
      description,
      image,
      parentId,
      mainCategoryId,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords
    } = data;

    // Generate slug if name is provided but slug isn't
    const finalSlug = name && !slug ? generateSlug(name) : slug;

    // Create the proper Prisma data structure
    const updateData: Prisma.CategoryUpdateInput = {
      name,
      // Only include slug if we have one (either provided or generated)
      ...(finalSlug ? { slug: finalSlug } : {}),
      description,
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
    };

    // If we have a parentId or mainCategoryId (for backward compatibility), connect it
    const effectiveParentId = parentId || mainCategoryId;
    if (effectiveParentId) {
      updateData.parent = {
        connect: { id: effectiveParentId }
      };
    } else if (parentId === null || mainCategoryId === null) {
      // Explicitly set parent to null if requested (converting to main category)
      updateData.parent = {
        disconnect: true
      };
    }

    return this.prisma.category.update({
      where: { id } as any,
      data: updateData,
      include: {
        parent: true,
        subcategories: {
          take: 5
        },
      },
    });
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string) {
    await this.prisma.category.delete({
      where: { id } as any,
    });

    return {
      success: true,
      message: 'Category deleted successfully',
    };
  }

  /**
   * Creates a new sub-category (third level category)
   */
  async createSubCategory(data: CreateSubCategoryInput) {
    const slug = data.slug || generateSlug(data.name);
    const { 
      categoryId, 
      name,
      description, 
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords
    } = data;

    // Create the proper Prisma data structure
    const createData: Prisma.CategoryCreateInput = {
      name,
      slug,
      description,
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
      // If categoryId is provided, connect it as the parent
      ...(categoryId ? {
        parent: {
          connect: { id: categoryId }
        }
      } : {})
    };

    return this.prisma.category.create({
      data: createData,
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
      },
    });
  }

  /**
   * Get all sub-categories with pagination and filtering (third level categories)
   */
  async findAllSubCategories(searchInput: SearchInput) {
    const { search, orderBy, limit = 10, page = 1, sortBy = 'createdAt', sortDirection = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Create the where condition - looking for third level categories
    let whereCondition: any = {
      // Category must have a parent
      parentId: { not: null },
      // And its parent must also have a parent (to ensure it's a "third level" category)
      parent: {
        parentId: { not: null },
      },
    };

    // Add search conditions if provided
    if (search) {
      whereCondition = {
        ...whereCondition,
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { slug: { contains: search, mode: 'insensitive' as any } },
        ],
      };
    }

    // Handle orderBy (new format) or fallback to sortBy/sortDirection (old format)
    let orderByClause: any = { [sortBy]: sortDirection };
    if (orderBy && orderBy.field) {
      orderByClause = { [orderBy.field]: orderBy.direction };
    }

    const [results, totalItems] = await Promise.all([
      this.prisma.category.findMany({
        where: whereCondition,
        orderBy: orderByClause,
        take: limit,
        skip,
        include: {
          parent: {
            include: {
              parent: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      results,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        itemCount: results.length,
      },
    };
  }

  /**
   * Get sub-categories by category ID
   */
  async getSubCategoriesByCategoryId(categoryId: string, searchInput: SearchInput) {
    const { search, orderBy, limit = 10, page = 1, sortBy = 'createdAt', sortDirection = 'desc' } = searchInput;
    const skip = (page - 1) * limit;

    // Create the where condition - find categories with parent ID matching the provided categoryId
    let whereCondition: any = {
      parentId: categoryId,
    };

    // Add search conditions if search is provided
    if (search) {
      whereCondition = {
        ...whereCondition,
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { slug: { contains: search, mode: 'insensitive' as any } },
        ],
      };
    }

    // Handle orderBy (new format) or fallback to sortBy/sortDirection (old format)
    let orderByClause: any = { [sortBy]: sortDirection };
    if (orderBy && orderBy.field) {
      orderByClause = { [orderBy.field]: orderBy.direction };
    }

    const [results, totalItems] = await Promise.all([
      this.prisma.category.findMany({
        where: whereCondition,
        orderBy: orderByClause,
        take: limit,
        skip,
        include: {
          parent: true,
          subcategories: {
            take: 5,
          },
        },
      }),
      this.prisma.category.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      results,
      meta: {
        totalItems,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        itemCount: results.length,
      },
    };
  }

  /**
   * Get featured sub-categories
   */
  async getFeaturedSubCategories() {
    // Use the new schema structure with self-referential category model
    // Find categories that are "deep" in the hierarchy (have both a parent and grandparent)
    return this.prisma.category.findMany({
      where: {
        isActive: true,
        // Category must have a parent
        parentId: { not: null },
        // And its parent must also have a parent (to ensure it's a "third level" category)
        parent: {
          parentId: { not: null },
        },
      } as any,
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
      },
    });
  }

  /**
   * Get a sub-category by its ID
   * This finds a category with both a parent and grandparent (third level)
   */
  async findSubCategoryById(id: string) {
    return this.prisma.category.findFirst({
      where: {
        id,
        // Category must have a parent
        parentId: { not: null },
        // And its parent must also have a parent (to ensure it's a "third level" category)
        parent: {
          parentId: { not: null },
        },
      } as any,
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
        subcategories: true,
      },
    });
  }
  
  /**
   * Get a sub-category by its slug
   * This finds a category with both a parent and grandparent (third level)
   */
  async findSubCategoryBySlug(slug: string) {
    return this.prisma.category.findFirst({
      where: {
        slug,
        // Category must have a parent
        parentId: { not: null },
        // And its parent must also have a parent (to ensure it's a "third level" category)
        parent: {
          parentId: { not: null },
        },
      } as any,
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
        subcategories: true,
      },
    });
  }

  /**
   * Update a sub-category (third level category)
   */
  async updateSubCategory(data: UpdateSubCategoryInput) {
    const { 
      id, 
      name,
      slug,
      description,
      image,
      categoryId, // This will be used as parentId
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords
    } = data;

    // Generate slug if name is provided but slug isn't
    const finalSlug = name && !slug ? generateSlug(name) : slug;

    // Create the proper Prisma data structure
    const updateData: Prisma.CategoryUpdateInput = {
      name,
      // Only include slug if we have one (either provided or generated)
      ...(finalSlug ? { slug: finalSlug } : {}),
      description,
      image,
      isActive,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
    };

    // If we have a categoryId, connect it as the parent
    if (categoryId) {
      updateData.parent = {
        connect: { id: categoryId }
      };
    }

    return this.prisma.category.update({
      where: { id } as any,
      data: updateData,
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
        subcategories: true,
      },
    });
  }

  /**
   * Delete a sub-category (third level category)
   */
  async deleteSubCategory(id: string) {
    await this.prisma.category.delete({
      where: { id } as any,
    });

    return {
      success: true,
      message: 'Sub-category deleted successfully',
    };
  }
}