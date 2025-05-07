import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BrandService } from './brand.service';
import { Brand, GetBrands } from './models/brand.model';
import { DeleteBrandResponse } from './models/brand-response.model';
import { CreateBrandInput } from './dto/create-brand.input';
import { UpdateBrandInput } from './dto/update-brand.input';
import { SearchBrandInput } from './dto/search-brand.input';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Brand)
export class BrandResolver {
  constructor(private readonly brandService: BrandService) {}

  /**
   * Create a new brand (Admin only)
   */
  @Mutation(() => Brand)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async createBrand(
    @Args('createBrandInput') createBrandInput: CreateBrandInput,
  ) {
    return this.brandService.createBrand(createBrandInput);
  }

  /**
   * Get all brands with pagination and filtering
   */
  @Query(() => GetBrands)
  async getBrands(@Args('searchInput') searchInput: SearchBrandInput) {
    return this.brandService.findAllBrands(searchInput);
  }

  /**
   * Get featured brands
   */
  @Query(() => [Brand])
  async getFeaturedBrands() {
    return this.brandService.getFeaturedBrands();
  }

  /**
   * Get a brand by ID
   */
  @Query(() => Brand)
  async getBrandById(@Args('id') id: string) {
    return this.brandService.findBrandById(id);
  }

  /**
   * Get a brand by slug
   */
  @Query(() => Brand)
  async getBrandBySlug(@Args('slug') slug: string) {
    return this.brandService.findBrandBySlug(slug);
  }

  /**
   * Update a brand (Admin only)
   */
  @Mutation(() => Brand)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async updateBrand(
    @Args('updateBrandInput') updateBrandInput: UpdateBrandInput,
  ) {
    return this.brandService.updateBrand(updateBrandInput);
  }

  /**
   * Delete a brand (Admin only)
   */
  @Mutation(() => DeleteBrandResponse)
  @UseGuards(AuthGuard)
  @Roles('ADMIN')
  async deleteBrand(@Args('id') id: string) {
    return this.brandService.deleteBrand(id);
  }
}