import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewInput, UpdateReviewInput, SearchReviewInput } from './dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new review for a product or seller
   */
  async createReview(userId: string, data: CreateReviewInput) {
    // Ensure that either productId or sellerId is provided, but not both
    if (!data.productId && !data.sellerId) {
      throw new Error('Either productId or sellerId must be provided');
    }
    if (data.productId && data.sellerId) {
      throw new Error('Only one of productId or sellerId can be provided');
    }

    // Create the review with type assertions to handle schema variations
    const review = await this.prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId,
        productId: data.productId,
        sellerId: data.sellerId,
        isVerified: false, // All reviews start as unverified
        isPublished: true, // But they are published by default
      } as any,
      include: {
        user: true,
        product: data.productId ? true : false,
        seller: data.sellerId ? true : false,
      } as any,
    });

    // Update the average rating for the product or seller
    if (data.productId) {
      await this.updateProductAverageRating(data.productId);
    } else if (data.sellerId) {
      await this.updateSellerAverageRating(data.sellerId);
    }

    return review;
  }

  /**
   * Get all reviews with pagination and filtering
   */
  async findAllReviews(searchInput: SearchReviewInput) {
    const { page, limit, searchTerm, userId, productId, sellerId, isVerified, isPublished, sortOrder, sortBy } = searchInput;
    const skip = (page - 1) * limit;

    // Construct the where clause based on the search parameters
    const where: any = {
      deletedAt: null,
    };

    if (searchTerm) {
      where.comment = {
        contains: searchTerm,
        mode: 'insensitive',
      } as any;
    }

    if (userId) {
      where.userId = userId;
    }

    if (productId) {
      where.productId = productId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    // Construct the orderBy object
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get the reviews and the total count
    const [reviews, totalItems] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: true,
          product: true,
          seller: true,
        } as any,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      results: reviews,
      meta: {
        totalItems,
        itemCount: reviews.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get reviews by user ID with pagination and filtering
   */
  async findReviewsByUserId(userId: string, searchInput: SearchReviewInput) {
    // Set the userId in the search input
    const modifiedSearchInput = { ...searchInput, userId };
    return this.findAllReviews(modifiedSearchInput);
  }

  /**
   * Get reviews by product ID with pagination and filtering
   */
  async findReviewsByProductId(productId: string, searchInput: SearchReviewInput) {
    // Set the productId in the search input
    const modifiedSearchInput = { ...searchInput, productId };
    return this.findAllReviews(modifiedSearchInput);
  }

  /**
   * Get reviews by seller ID with pagination and filtering
   */
  async findReviewsBySellerId(sellerId: string, searchInput: SearchReviewInput) {
    // Set the sellerId in the search input
    const modifiedSearchInput = { ...searchInput, sellerId };
    return this.findAllReviews(modifiedSearchInput);
  }

  /**
   * Get a review by its ID
   */
  async findReviewById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id } as any,
      include: {
        user: true,
        product: true,
        seller: true,
      } as any,
    });

    // Check both for null and for deletedAt if that field exists
    if (!review || (review as any).deletedAt) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  /**
   * Update a review
   */
  async updateReview(data: UpdateReviewInput) {
    const review = await this.findReviewById(data.id);

    const updatedReview = await this.prisma.review.update({
      where: { id: data.id } as any,
      data: {
        rating: data.rating !== undefined ? data.rating : review.rating,
        comment: data.comment !== undefined ? data.comment : review.comment,
        isVerified: data.isVerified !== undefined ? data.isVerified : review.isVerified,
        isPublished: data.isPublished !== undefined ? data.isPublished : review.isPublished,
      } as any,
      include: {
        user: true,
        product: true,
        seller: true,
      } as any,
    });

    // If rating was updated, recalculate the average rating
    if (data.rating !== undefined) {
      if (review.productId) {
        await this.updateProductAverageRating(review.productId);
      } else if ((review as any).sellerId) {
        await this.updateSellerAverageRating((review as any).sellerId);
      }
    }

    return updatedReview;
  }

  /**
   * Delete a review (soft delete)
   */
  async deleteReview(id: string) {
    const review = await this.findReviewById(id);

    // Soft delete by setting deletedAt
    const deletedReview = await this.prisma.review.update({
      where: { id } as any,
      data: {
        deletedAt: new Date(),
        isPublished: false,
      } as any,
    });

    // Recalculate the average rating for the product or seller
    if (review.productId) {
      await this.updateProductAverageRating(review.productId);
    } else if ((review as any).sellerId) {
      await this.updateSellerAverageRating((review as any).sellerId);
    }

    return { success: true, message: 'Review deleted successfully' };
  }

  /**
   * Update the average rating for a product
   */
  private async updateProductAverageRating(productId: string) {
    // Get all active reviews for the product
    const reviews = await this.prisma.review.findMany({
      where: {
        productId,
        isPublished: true,
        deletedAt: null,
      } as any,
      select: {
        rating: true,
      },
    });

    // Calculate the average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const reviewCount = reviews.length;

    // Update the product with the new average rating and review count
    await this.prisma.product.update({
      where: { id: productId } as any,
      data: {
        averageRating,
        reviewCount,
      } as any,
    });
  }

  /**
   * Update the average rating for a seller
   */
  private async updateSellerAverageRating(sellerId: string) {
    // Get all active reviews for the seller
    const reviews = await this.prisma.review.findMany({
      where: {
        sellerId,
        isPublished: true,
        deletedAt: null,
      } as any,
      select: {
        rating: true,
      },
    });

    // Calculate the average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const reviewCount = reviews.length;

    // Update the seller with the new average rating and review count
    await this.prisma.seller.update({
      where: { id: sellerId } as any,
      data: {
        averageRating,
        reviewCount,
      } as any,
    });
  }
}