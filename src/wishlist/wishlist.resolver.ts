import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Wishlist, GetWishlists } from './models/wishlist.model';
import { RemoveWishlistResponse, WishlistCheckResponse } from './models/wishlist-response.model';
import { AddToWishlistInput } from './dto/add-to-wishlist.input';
import { RemoveFromWishlistInput } from './dto/remove-from-wishlist.input';
import { SearchWishlistInput } from './dto/search-wishlist.input';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Wishlist)
export class WishlistResolver {
  constructor(private readonly wishlistService: WishlistService) {}

  /**
   * Add a product to the wishlist (User only)
   */
  @Mutation(() => Wishlist)
  @UseGuards(AuthGuard)
  @Roles('USER')
  async addToWishlist(
    @Args('addToWishlistInput') addToWishlistInput: AddToWishlistInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.wishlistService.addToWishlist(userId, addToWishlistInput);
  }

  /**
   * Remove a product from the wishlist (User only)
   */
  @Mutation(() => RemoveWishlistResponse)
  @UseGuards(AuthGuard)
  @Roles('USER')
  async removeFromWishlist(
    @Args('removeFromWishlistInput') removeFromWishlistInput: RemoveFromWishlistInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.wishlistService.removeFromWishlist(userId, removeFromWishlistInput.id);
  }

  /**
   * Get the user's wishlist with pagination and filtering (User only)
   */
  @Query(() => GetWishlists)
  @UseGuards(AuthGuard)
  @Roles('USER')
  async getMyWishlist(
    @Args('searchInput') searchInput: SearchWishlistInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.wishlistService.getUserWishlist(userId, searchInput);
  }

  /**
   * Get a single wishlist item by ID (User only)
   */
  @Query(() => Wishlist)
  @UseGuards(AuthGuard)
  @Roles('USER')
  async getWishlistItemById(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.wishlistService.getWishlistItemById(userId, id);
  }

  /**
   * Check if a product is in user's wishlist (User only)
   */
  @Query(() => WishlistCheckResponse)
  @UseGuards(AuthGuard)
  @Roles('USER')
  async isProductInWishlist(
    @Args('productId') productId: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.wishlistService.isProductInWishlist(userId, productId);
  }
}