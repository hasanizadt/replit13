import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartInput, UpdateCartInput, SearchCartInput } from './dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add a product to the user's cart
   */
  async addToCart(userId: string, data: AddToCartInput) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId } as any,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${data.productId} not found`);
    }

    // Check if seller exists
    const seller = await this.prisma.user.findUnique({
      where: { id: data.sellerId } as any,
    });

    if (!seller) {
      throw new NotFoundException(`Seller with ID ${data.sellerId} not found`);
    }

    // Check if product quantity is available
    if (product.stock < data.reserved) {
      throw new BadRequestException(
        `Requested quantity (${data.reserved}) exceeds available stock (${product.stock})`,
      );
    }

    // Check if the product already exists in the cart
    const existingCartItem = await this.prisma.cart.findFirst({
      where: {
        userId,
        productId: data.productId,
        product: {
          sellerId: data.sellerId
        }
      } as any,
    });

    // If product already exists in cart, update the quantity
    if (existingCartItem) {
      // Using type assertion for accessing reserved property
      const totalReserved = (existingCartItem as any).reserved + data.reserved;

      // Check if the new total quantity exceeds available stock
      // Using stock instead of quantity based on Product schema
      if (totalReserved > product.stock) {
        throw new BadRequestException(
          `Total requested quantity (${totalReserved}) exceeds available stock (${product.stock})`,
        );
      }

      // Using type assertion for the whole prisma call
      return this.prisma.cart.update({
        where: { id: existingCartItem.id } as any,
        data: {
          reserved: totalReserved,
          // Type assertion for attributes which might not be in the Prisma schema
          ...(data.attributes ? { attributes: data.attributes } : {}),
        } as any,
        include: {
          user: true,
          product: {
            include: {
              seller: true
            }
          },
        },
      } as any);
    }

    // Create a new cart item
    // Using type assertion for the whole prisma call
    return this.prisma.cart.create({
      data: {
        userId,
        productId: data.productId,
        product: {
          connect: {
            id: data.productId
          }
        },
        reserved: data.reserved,
        ...(data.attributes ? { attributes: data.attributes } : {}),
      } as any,
      include: {
        user: true,
        product: {
          include: {
            seller: true
          }
        },
      },
    } as any);
  }

  /**
   * Update a cart item
   */
  async updateCart(userId: string, data: UpdateCartInput) {
    // Check if cart item exists
    const cartItem = await this.prisma.cart.findUnique({
      where: { id: data.id } as any,
      include: {
        product: {
          include: {
            seller: true
          }
        },
      },
    } as any);

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${data.id} not found`);
    }

    // Check if the cart item belongs to the user
    if (cartItem.userId !== userId) {
      throw new BadRequestException('You do not have permission to update this cart item');
    }

    // Prepare update data
    const updateData: any = {};

    // Update reserved quantity if provided
    if (data.reserved !== undefined) {
      // Check if requested quantity is available
      // Using type assertion for product quantity - it might be stock field in the schema
      const productQuantity = (cartItem as any).product.quantity || (cartItem as any).product.stock;
      if (data.reserved > productQuantity) {
        throw new BadRequestException(
          `Requested quantity (${data.reserved}) exceeds available stock (${productQuantity})`,
        );
      }
      updateData.reserved = data.reserved;
    }

    // Update attributes if provided
    // Handle attributes field which might not be in Prisma schema
    if (data.attributes !== undefined) {
      (updateData as any).attributes = data.attributes;
    }

    // Update the cart item
    // Using type assertion for the whole prisma call
    return this.prisma.cart.update({
      where: { id: data.id } as any,
      data: updateData,
      include: {
        user: true,
        product: {
          include: {
            seller: true
          }
        },
      },
    } as any);
  }

  /**
   * Remove a product from the cart
   */
  async removeFromCart(userId: string, cartId: string) {
    // Check if cart item exists
    const cartItem = await this.prisma.cart.findUnique({
      where: { id: cartId } as any,
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartId} not found`);
    }

    // Check if the cart item belongs to the user
    if (cartItem.userId !== userId) {
      throw new BadRequestException('You do not have permission to remove this cart item');
    }

    // Delete the cart item
    await this.prisma.cart.delete({
      where: { id: cartId } as any,
    });

    return { success: true, message: 'Item removed from cart successfully' };
  }

  /**
   * Clear the user's cart
   */
  async clearCart(userId: string) {
    // Delete all items in the user's cart
    await this.prisma.cart.deleteMany({
      where: { userId } as any,
    });

    return { success: true, message: 'Cart cleared successfully' };
  }

  /**
   * Get user's cart items with pagination and filtering
   */
  async getUserCart(userId: string, searchInput: SearchCartInput) {
    const { page, limit, productId, sellerId, sortOrder, sortBy } = searchInput;
    const skip = (page - 1) * limit;

    // Construct the where clause based on the search parameters
    const where: any = {
      userId,
    };

    if (productId) {
      where.productId = productId;
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    // Construct the orderBy object
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get cart items and the total count
    const [cartItems, totalItems] = await Promise.all([
      this.prisma.cart.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: true,
          product: {
            include: {
              seller: true
            }
          },
        },
      }),
      this.prisma.cart.count({ where }),
    ]);

    return {
      results: cartItems,
      meta: {
        totalItems,
        itemCount: cartItems.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get a cart item by ID
   */
  async getCartItemById(userId: string, cartId: string) {
    const cartItem = await this.prisma.cart.findUnique({
      where: { id: cartId } as any,
      include: {
        user: true,
        product: {
          include: {
            seller: true
          }
        },
      },
    } as any);

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartId} not found`);
    }

    // Check if the cart item belongs to the user
    if (cartItem.userId !== userId) {
      throw new BadRequestException('You do not have permission to view this cart item');
    }

    return cartItem;
  }

  /**
   * Get cart summary (total items, subtotal, tax, shipping, discount, total)
   */
  async getCartSummary(userId: string) {
    // Get all cart items
    const cartItems = await this.prisma.cart.findMany({
      where: { userId } as any,
      include: {
        product: {
          include: {
            seller: true
          }
        },
      },
    } as any);

    if (cartItems.length === 0) {
      return {
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
      };
    }

    // Calculate summary
    // Using type assertion for accessing reserved property
    const totalItems = cartItems.reduce((sum, item) => sum + (item as any).reserved, 0);

    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    cartItems.forEach(item => {
      // Using type assertion for accessing product and reserved properties
      const typedItem = item as any;
      const itemPrice = typedItem.product.price * typedItem.reserved;
      subtotal += itemPrice;

      // Calculate tax based on taxRate
      const taxRate = typedItem.product.taxRate || 0;
      tax += (itemPrice * taxRate) / 100;

      // Calculate discount if product has discount
      if (typedItem.product.discount) {
        if (typedItem.product.discountUnit === 'PERCENT') {
          discount += (itemPrice * typedItem.product.discount) / 100;
        } else {
          discount += typedItem.product.discount * typedItem.reserved;
        }
      }
    });

    // For simplicity, let's set a fixed shipping cost (in a real application, this would be calculated based on shipping rules)
    const shipping = subtotal > 0 ? 10 : 0;

    // Calculate the total
    const total = subtotal + tax + shipping - discount;

    return {
      totalItems,
      subtotal,
      tax,
      shipping,
      discount,
      total,
    };
  }
}