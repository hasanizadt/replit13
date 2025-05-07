import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart, GetCarts, CartSummary } from './models/cart.model';
import { 
  AddToCartInput, 
  UpdateCartInput, 
  RemoveFromCartInput, 
  SearchCartInput, 
  ClearCartInput 
} from './dto';
import { AuthGuard } from '../auth/auth.guard';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  /**
   * Add a product to the cart (User only)
   */
  @Mutation(() => Cart)
  @UseGuards(AuthGuard)
  async addToCart(
    @Args('addToCartInput') addToCartInput: AddToCartInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.cartService.addToCart(userId, addToCartInput);
  }

  /**
   * Update a cart item (User only)
   */
  @Mutation(() => Cart)
  @UseGuards(AuthGuard)
  async updateCart(
    @Args('updateCartInput') updateCartInput: UpdateCartInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.cartService.updateCart(userId, updateCartInput);
  }

  /**
   * Remove a product from the cart (User only)
   */
  @Mutation(() => Cart)
  @UseGuards(AuthGuard)
  async removeFromCart(
    @Args('removeFromCartInput') removeFromCartInput: RemoveFromCartInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.cartService.removeFromCart(userId, removeFromCartInput.id);
  }

  /**
   * Clear the cart (User only)
   */
  @Mutation(() => Cart)
  @UseGuards(AuthGuard)
  async clearCart(
    @Args('clearCartInput') clearCartInput: ClearCartInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.cartService.clearCart(userId);
  }

  /**
   * Get the user's cart (User only)
   */
  @Query(() => GetCarts)
  @UseGuards(AuthGuard)
  async getMyCart(
    @Args('searchInput') searchInput: SearchCartInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.cartService.getUserCart(userId, searchInput);
  }

  /**
   * Get a single cart item by ID (User only)
   */
  @Query(() => Cart)
  @UseGuards(AuthGuard)
  async getCartItemById(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.cartService.getCartItemById(userId, id);
  }

  /**
   * Get cart summary (total items, subtotal, tax, shipping, discount, total) (User only)
   */
  @Query(() => CartSummary)
  @UseGuards(AuthGuard)
  async getCartSummary(@Context() context) {
    const userId = context.req.user.id;
    return this.cartService.getCartSummary(userId);
  }
}