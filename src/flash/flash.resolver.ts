import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FlashService } from './flash.service';
import { Flash, GetFlashSales } from './models/flash.model';
import { DeleteFlashResponse } from './models/flash-response.model';
import { CreateFlashInput } from './dto/create-flash.input';
import { UpdateFlashInput } from './dto/update-flash.input';
import { SearchFlashInput } from './dto/search-flash.input';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Flash)
export class FlashResolver {
  constructor(private readonly flashService: FlashService) {}

  /**
   * Create a new flash sale (Admin only)
   */
  @Mutation(() => Flash)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async createFlash(
    @Args('createFlashInput') createFlashInput: CreateFlashInput,
  ) {
    return this.flashService.createFlash(createFlashInput);
  }

  /**
   * Get all flash sales with pagination and filtering
   */
  @Query(() => GetFlashSales)
  async getFlashSales(@Args('searchInput') searchInput: SearchFlashInput) {
    return this.flashService.findAllFlashes(searchInput);
  }

  /**
   * Get active flash sales
   */
  @Query(() => [Flash])
  async getActiveFlashSales() {
    return this.flashService.getActiveFlashes();
  }

  /**
   * Get a flash sale by ID
   */
  @Query(() => Flash)
  async getFlashById(@Args('id') id: string) {
    return this.flashService.findFlashById(id);
  }

  /**
   * Get a flash sale by slug
   */
  @Query(() => Flash)
  async getFlashBySlug(@Args('slug') slug: string) {
    return this.flashService.findFlashBySlug(slug);
  }

  /**
   * Update a flash sale (Admin only)
   */
  @Mutation(() => Flash)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updateFlash(
    @Args('updateFlashInput') updateFlashInput: UpdateFlashInput,
  ) {
    return this.flashService.updateFlash(updateFlashInput);
  }

  /**
   * Add products to a flash sale (Admin only)
   */
  @Mutation(() => Flash)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async addProductsToFlash(
    @Args('flashId') flashId: string,
    @Args({ name: 'productIds', type: () => [String] }) productIds: string[],
  ) {
    return this.flashService.addProductsToFlash(flashId, productIds);
  }

  /**
   * Remove products from a flash sale (Admin only)
   */
  @Mutation(() => Flash)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async removeProductsFromFlash(
    @Args('flashId') flashId: string,
    @Args({ name: 'productIds', type: () => [String] }) productIds: string[],
  ) {
    return this.flashService.removeProductsFromFlash(flashId, productIds);
  }

  /**
   * Delete a flash sale (Admin only)
   */
  @Mutation(() => DeleteFlashResponse)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async deleteFlash(@Args('id') id: string) {
    return this.flashService.deleteFlash(id);
  }
}