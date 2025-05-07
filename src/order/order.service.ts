import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';
import { SearchOrderInput } from './dto/search-order.input';
import { OrderByInput } from '../common/dto/order-by.input';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get the order by clause based on different input formats
function getOrderByClause(orderByInput?: OrderByInput | any, sortBy = 'createdAt', sortDirection = 'desc'): any {
  // New format with OrderByInput object
  if (orderByInput && typeof orderByInput === 'object' && orderByInput.field) {
    return { [orderByInput.field]: orderByInput.direction };
  }
  
  // Legacy string format (can also accept just a field name)
  if (sortBy && typeof sortBy === 'string') {
    return { [sortBy]: sortDirection };
  }
  
  // Default sorting
  return { createdAt: 'desc' };
}

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new order
   */
  async createOrder(userId: string, data: CreateOrderInput) {
    // Generate a unique order ID
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate product prices, subtotal and total
    const productDetails = await Promise.all(
      data.products.map(async (item) => {
        // Use type assertion for Prisma model mismatch
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId } as any,
          include: { seller: true },
        }) as any;

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        // Check against stock or quantity field (depending on schema)
        const availableQuantity = product.stock || product.quantity;
        if (availableQuantity < item.quantity) {
          throw new Error(`Not enough stock for product: ${product.name}`);
        }

        return {
          product,
          quantity: item.quantity,
          attributes: item.attributes || [],
          amount: product.price * item.quantity,
          tax: (product.tax / 100) * product.price * item.quantity,
          sellerId: product.sellerId,
          sellerName: product.seller.shopName,
        };
      }),
    );

    // Group products by seller
    const groupedBySeller = productDetails.reduce((acc, item) => {
      const { sellerId } = item;
      if (!acc[sellerId]) {
        acc[sellerId] = {
          sellerId,
          shopName: item.sellerName,
          products: [],
          price: 0,
        };
      }
      
      acc[sellerId].products.push({
        productId: item.product.id,
        quantity: item.quantity,
        attributes: item.attributes,
        tax: item.tax,
        amount: item.amount,
      });
      
      acc[sellerId].price += item.amount + item.tax;
      
      return acc;
    }, {});

    // Calculate subtotal, shipping, and total
    const subtotal = productDetails.reduce((sum, item) => sum + item.amount, 0);
    const shippingFees = 0; // This should be calculated based on your shipping policy
    const shippingCount = Object.keys(groupedBySeller).length;
    
    // Apply coupon discount if available
    const couponDiscount = 0; // This should be calculated if a coupon is applied
    
    const total = subtotal + 
      productDetails.reduce((sum, item) => sum + item.tax, 0) + 
      shippingFees - 
      couponDiscount;

    // Create the order and related records in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Create the main order
      // Use type assertion for Prisma model mismatch
      const order = await tx.order.create({
        data: {
          orderId,
          userId,
          subtotal,
          total,
          couponDiscount,
          note: data.note,
          paymentStatus: false, // Initially payment is not completed
          status: 'PENDING',
          shippingAddressId: data.shippingAddressId,
          billingAddressId: data.billingAddressId || data.shippingAddressId,
          shippingCount,
          shippingFees,
          payment: {
            create: {
              paymentMethod: data.paymentMethod,
              provider: data.paymentMethod.toUpperCase(),
            }
          } as any,
          // Create order items for each product
          orderItems: {
            create: data.products.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productDetails.find(p => p.product.id === item.productId).amount,
            })),
          } as any,
          // Create order sellers for each seller
          orderSellers: {
            create: Object.values(groupedBySeller).map((sellerGroup: any) => ({
              sellerId: sellerGroup.sellerId,
              shopName: sellerGroup.shopName,
              price: sellerGroup.price,
              status: 'PENDING',
              // Create order products for each seller's products
              products: {
                create: sellerGroup.products.map((product: any) => ({
                  productId: product.productId,
                  quantity: product.quantity,
                  attributes: product.attributes,
                  tax: product.tax,
                  amount: product.amount,
                })),
              },
            })),
          } as any,
        } as any,
        include: {
          orderItems: true,
          orderSellers: {
            include: {
              products: true,
            },
          },
        } as any,
      });

      // Update product quantities
      for (const item of data.products) {
        // First get the product to check which field to update
        const productItem = await tx.product.findUnique({
          where: { id: item.productId } as any,
        }) as any;
        
        await tx.product.update({
          where: { id: item.productId } as any,
          data: {
            // May need to use stock instead of quantity depending on schema
            ...(productItem.quantity !== undefined ? {
              quantity: {
                decrement: item.quantity,
              }
            } : {
              stock: {
                decrement: item.quantity,
              }
            }),
            sales: {
              increment: item.quantity,
            },
          } as any,
        });
      }

      return order;
    });
  }

  /**
   * Get all orders with pagination and filtering
   */
  async findAllOrders(searchInput: SearchOrderInput) {
    const { page = 1, limit = 10, search, status, paymentStatus, sortBy = 'createdAt', sortOrder = 'desc', orderBy } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where conditions
    const where: any = {};

    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus !== undefined) {
      where.paymentStatus = paymentStatus;
    }

    // Get the total count
    const totalItems = await this.prisma.order.count({ where });

    // Get the orders - using type assertion for Prisma model mismatch
    const orders = await this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: getOrderByClause(orderBy, sortBy, sortOrder),
      include: {
        user: true,
        orderSellers: {
          include: {
            seller: true,
            products: {
              include: {
                product: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    } as any);

    // Return with pagination metadata
    return {
      results: orders,
      meta: {
        totalItems,
        itemCount: orders.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get orders by user ID with pagination and filtering
   */
  async findOrdersByUserId(userId: string, searchInput: SearchOrderInput) {
    const { page = 1, limit = 10, status, paymentStatus, sortBy = 'createdAt', sortOrder = 'desc', orderBy } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where conditions
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (paymentStatus !== undefined) {
      where.paymentStatus = paymentStatus;
    }

    // Get the total count
    const totalItems = await this.prisma.order.count({ where });

    // Get the orders
    const orders = await this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: getOrderByClause(orderBy, sortBy, sortOrder),
      include: {
        orderSellers: {
          include: {
            seller: true,
            products: {
              include: {
                product: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    } as any);

    // Return with pagination metadata
    return {
      results: orders,
      meta: {
        totalItems,
        itemCount: orders.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get orders by seller ID with pagination and filtering
   */
  async findOrdersBySellerId(sellerId: string, searchInput: SearchOrderInput) {
    const { page = 1, limit = 10, status, paymentStatus, sortBy = 'createdAt', sortOrder = 'desc', orderBy } = searchInput;
    const skip = (page - 1) * limit;

    // Build the where conditions for order sellers
    const where: any = { 
      orderSellers: {
        some: {
          sellerId,
        },
      },
    };

    if (status) {
      where.orderSellers = {
        ...where.orderSellers,
        some: {
          ...where.orderSellers.some,
          status,
        },
      };
    }

    if (paymentStatus !== undefined) {
      where.paymentStatus = paymentStatus;
    }

    // Get the total count
    const totalItems = await this.prisma.order.count({ where });

    // Get the orders
    const orders = await this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: getOrderByClause(orderBy, sortBy, sortOrder),
      include: {
        user: true,
        orderSellers: {
          where: {
            sellerId,
          },
          include: {
            products: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    } as any);

    // Return with pagination metadata
    return {
      results: orders,
      meta: {
        totalItems,
        itemCount: orders.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get an order by its ID
   */
  async findOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id } as any,
      include: {
        user: true,
        orderSellers: {
          include: {
            seller: true,
            products: {
              include: {
                product: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      } as any,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Get an order by its orderId (tracking number)
   */
  async findOrderByOrderId(orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderId } as any, // Type assertion for the orderId field
      include: {
        user: true,
        orderSellers: {
          include: {
            seller: true,
            products: {
              include: {
                product: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      } as any, // Type assertion for include structure
    });

    if (!order) {
      throw new NotFoundException(`Order with tracking number ${orderId} not found`);
    }

    return order;
  }

  /**
   * Update an order's status
   */
  async updateOrderStatus(data: UpdateOrderStatusInput) {
    const order = await this.prisma.order.findUnique({
      where: { id: data.id } as any,
      include: {
        orderSellers: true,
      } as any,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${data.id} not found`);
    }

    // Update the order's status - using type assertion for status enum
    const updatedOrder = await this.prisma.order.update({
      where: { id: data.id } as any,
      data: {
        status: data.status,
      } as any, // Type assertion for enum status
      include: {
        user: true,
        orderSellers: {
          include: {
            seller: true,
            products: {
              include: {
                product: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      } as any,
    });

    return updatedOrder;
  }

  /**
   * Update an order seller's status
   */
  async updateOrderSellerStatus(id: string, data: UpdateOrderStatusInput) {
    const orderSeller = await (this.prisma as any).orderSeller.findUnique({
      where: { id } as any,
    });

    if (!orderSeller) {
      throw new NotFoundException(`Order seller with ID ${id} not found`);
    }

    // Update the order seller's status
    const updatedOrderSeller = await (this.prisma as any).orderSeller.update({
      where: { id } as any,
      data: {
        status: data.status,
        cancelBy: data.cancelBy,
      } as any,
      include: {
        order: true,
        seller: true,
        products: {
          include: {
            product: true,
          },
        },
      } as any,
    });

    // Check if all order sellers are in the same status
    const allOrderSellers = await (this.prisma as any).orderSeller.findMany({
      where: {
        orderId: orderSeller.orderId,
      } as any,
    });

    const allSellersSameStatus = allOrderSellers.every(
      (seller) => seller.status === data.status,
    );

    // If all sellers have the same status, update the main order status
    if (allSellersSameStatus) {
      await this.prisma.order.update({
        where: { id: orderSeller.orderId } as any,
        data: {
          status: data.status,
        } as any,
      });
    }

    return updatedOrderSeller;
  }

  /**
   * Update payment status for an order
   */
  async updatePaymentStatus(id: string, paymentStatus: boolean) {
    const order = await this.prisma.order.findUnique({
      where: { id } as any,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.prisma.order.update({
      where: { id } as any,
      data: {
        paymentStatus,
      } as any, // Type assertion for paymentStatus field
      include: {
        user: true,
        orderSellers: {
          include: {
            seller: true,
            products: {
              include: {
                product: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      } as any,
    });
  }

  /**
   * Find an order seller by its ID
   */
  async findOrderSellerById(id: string) {
    const orderSeller = await (this.prisma as any).orderSeller.findUnique({
      where: { id } as any,
      include: {
        order: true,
        seller: true,
        products: {
          include: {
            product: true,
          },
        },
      } as any,
    });

    if (!orderSeller) {
      throw new NotFoundException(`Order seller with ID ${id} not found`);
    }

    return orderSeller;
  }
}