import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order, GetOrders } from './models/order.model';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';
import { SearchOrderInput } from './dto/search-order.input';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrderSeller } from './models/order-seller.model';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Create a new order (User only)
   */
  @Mutation(() => Order)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER')
  async createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.orderService.createOrder(userId, createOrderInput);
  }

  /**
   * Get all orders with pagination and filtering (Admin only)
   */
  @Query(() => GetOrders)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getOrders(@Args('searchInput') searchInput: SearchOrderInput) {
    return this.orderService.findAllOrders(searchInput);
  }

  /**
   * Get my orders with pagination and filtering (User only)
   */
  @Query(() => GetOrders)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('USER')
  async getMyOrders(
    @Args('searchInput') searchInput: SearchOrderInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.orderService.findOrdersByUserId(userId, searchInput);
  }

  /**
   * Get orders for a seller with pagination and filtering (Seller only)
   */
  @Query(() => GetOrders)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SELLER')
  async getSellerOrders(
    @Args('searchInput') searchInput: SearchOrderInput,
    @Context() context,
  ) {
    const sellerId = context.req.user.id;
    return this.orderService.findOrdersBySellerId(sellerId, searchInput);
  }

  /**
   * Get an order by ID (Admin, User - own orders, Seller - own orders)
   */
  @Query(() => Order)
  @UseGuards(AuthGuard)
  async getOrderById(@Args('id') id: string, @Context() context) {
    const { user } = context.req;
    const order = await this.orderService.findOrderById(id);

    // Check if the user has permission to view this order
    if (user.role === 'ADMIN') {
      return order;
    } else if (user.role === 'USER' && order.userId === user.id) {
      return order;
    } else if (user.role === 'SELLER') {
      const hasSeller = Array.isArray(order.orderSellers) && order.orderSellers.some(
        (orderSeller) => orderSeller.sellerId === user.id,
      );
      if (hasSeller) return order;
    }

    throw new Error('You do not have permission to view this order');
  }

  /**
   * Get an order by its orderId/tracking number (Admin, User - own orders, Seller - own orders)
   */
  @Query(() => Order)
  @UseGuards(AuthGuard)
  async getOrderByOrderId(@Args('orderId') orderId: string, @Context() context) {
    const { user } = context.req;
    const order = await this.orderService.findOrderByOrderId(orderId);

    // Check if the user has permission to view this order
    if (user.role === 'ADMIN') {
      return order;
    } else if (user.role === 'USER' && order.userId === user.id) {
      return order;
    } else if (user.role === 'SELLER') {
      const hasSeller = Array.isArray(order.orderSellers) && order.orderSellers.some(
        (orderSeller) => orderSeller.sellerId === user.id,
      );
      if (hasSeller) return order;
    }

    throw new Error('You do not have permission to view this order');
  }

  /**
   * Update an order's status (Admin only)
   */
  @Mutation(() => Order)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateOrderStatus(
    @Args('updateOrderStatusInput') updateOrderStatusInput: UpdateOrderStatusInput,
  ) {
    return this.orderService.updateOrderStatus(updateOrderStatusInput);
  }

  /**
   * Update an order seller's status (Admin and Seller only)
   */
  @Mutation(() => OrderSeller)
  @UseGuards(AuthGuard)
  async updateOrderSellerStatus(
    @Args('id') id: string,
    @Args('updateOrderStatusInput') updateOrderStatusInput: UpdateOrderStatusInput,
    @Context() context,
  ) {
    const { user } = context.req;
    
    // Get the order seller to check permissions
    const orderSeller = await this.orderService.findOrderSellerById(id);
    
    // Check if the user has permission to update this order seller
    if (user.role === 'ADMIN') {
      return this.orderService.updateOrderSellerStatus(id, updateOrderStatusInput);
    } else if (user.role === 'SELLER' && orderSeller.sellerId === user.id) {
      return this.orderService.updateOrderSellerStatus(id, updateOrderStatusInput);
    }
    
    throw new Error('You do not have permission to update this order');
  }

  /**
   * Update an order's payment status (Admin only)
   */
  @Mutation(() => Order)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updatePaymentStatus(
    @Args('id') id: string,
    @Args('paymentStatus') paymentStatus: boolean,
  ) {
    return this.orderService.updatePaymentStatus(id, paymentStatus);
  }
}