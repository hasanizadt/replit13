import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product, GetProducts } from './models/product.model';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { SearchProductInput } from './dto/search-product.input';
import { Brand, GetBrands } from './models/brand.model';
import { CreateBrandInput } from './dto/create-brand.input';
import { UpdateBrandInput } from './dto/update-brand.input';
import { Tag, GetTags } from './models/tag.model';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';
import { Shop, GetShops } from './models/shop.model';
import { CreateShopInput } from './dto/create-shop.input';
import { UpdateShopInput } from './dto/update-shop.input';
import { Seller, GetProductSellers } from './models/seller.model';
import { CreateSellerInput } from './dto/create-seller.input';
import { UpdateSellerInput } from './dto/update-seller.input';
import { Flash, GetFlashes } from './models/flash.model';
import { CreateFlashInput } from './dto/create-flash.input';
import { UpdateFlashInput } from './dto/update-flash.input';
import { SearchInput } from '../common/dto/search.input';
import { SuccessInfo } from '../common/models/success.model';
import { Roles } from '../auth/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  /**
   * Create a new product (Admin and Seller only)
   */
  @Mutation(() => Product)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SELLER')
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    return this.productService.createProduct(createProductInput);
  }

  /**
   * Get all products with pagination and filtering
   */
  @Query(() => [Product], { name: 'products' })
  async getProducts(@Args('searchInput') searchInput: SearchProductInput) {
    const result = await this.productService.findAllProducts(searchInput);
    // Since we can't use GetProducts directly due to TypeScript issues, we're returning just the products array
    // This is a temporary fix until we can properly use the GetProducts type
    return result.results || [];
  }

  /**
   * Get featured products
   */
  @Query(() => [Product], { name: 'featuredProducts' })
  async getFeaturedProducts() {
    return this.productService.getFeaturedProducts();
  }

  /**
   * Get a product by ID
   */
  @Query(() => Product, { name: 'product' })
  async getProductById(@Args('id') id: string) {
    return this.productService.findProductById(id);
  }

  /**
   * Get a product by slug
   */
  @Query(() => Product, { name: 'productBySlug' })
  async getProductBySlug(@Args('slug') slug: string) {
    return this.productService.findProductBySlug(slug);
  }

  /**
   * Update a product (Admin and Seller only)
   */
  @Mutation(() => Product)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SELLER')
  async updateProduct(
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
    @Context() context,
  ) {
    // For a seller, we would check if they own the product
    // For an admin, they can update any product
    return this.productService.updateProduct(updateProductInput);
  }

  /**
   * Delete a product (Admin and Seller only)
   */
  @Mutation(() => SuccessInfo)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SELLER')
  async deleteProduct(@Args('id') id: string, @Context() context) {
    // For a seller, we would check if they own the product
    // For an admin, they can delete any product
    return this.productService.deleteProduct(id);
  }

  /**
   * Approve a product (Admin only)
   */
  @Mutation(() => Product)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async approveProduct(@Args('id') id: string) {
    return this.productService.approveProduct(id);
  }

  /**
   * Create a new brand (Admin only)
   */
  @Mutation(() => Brand)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createBrand(
    @Args('createBrandInput') createBrandInput: CreateBrandInput,
  ) {
    return this.productService.createBrand(createBrandInput);
  }

  /**
   * Get all brands with pagination and filtering
   */
  @Query(() => GetBrands, { name: 'brands' })
  async getBrands(@Args('searchInput') searchInput: SearchInput) {
    return this.productService.findAllBrands(searchInput);
  }

  /**
   * Get featured brands
   */
  @Query(() => [Brand], { name: 'featuredBrands' })
  async getFeaturedBrands() {
    return this.productService.getFeaturedBrands();
  }

  /**
   * Get a brand by ID
   */
  @Query(() => Brand, { name: 'brand' })
  async getBrandById(@Args('id') id: string) {
    return this.productService.findBrandById(id);
  }

  /**
   * Update a brand (Admin only)
   */
  @Mutation(() => Brand)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateBrand(
    @Args('updateBrandInput') updateBrandInput: UpdateBrandInput,
  ) {
    return this.productService.updateBrand(updateBrandInput);
  }

  /**
   * Delete a brand (Admin only)
   */
  @Mutation(() => SuccessInfo)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteBrand(@Args('id') id: string) {
    return this.productService.deleteBrand(id);
  }

  /**
   * Create a new tag (Admin only)
   */
  @Mutation(() => Tag)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createTag(@Args('createTagInput') createTagInput: CreateTagInput) {
    return this.productService.createTag(createTagInput);
  }

  /**
   * Get all tags with pagination and filtering
   */
  @Query(() => GetTags, { name: 'tags' })
  async getTags(@Args('searchInput') searchInput: SearchInput) {
    return this.productService.findAllTags(searchInput);
  }

  /**
   * Get a tag by ID
   */
  @Query(() => Tag, { name: 'tag' })
  async getTagById(@Args('id') id: string) {
    return this.productService.findTagById(id);
  }

  /**
   * Update a tag (Admin only)
   */
  @Mutation(() => Tag)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateTag(@Args('updateTagInput') updateTagInput: UpdateTagInput) {
    return this.productService.updateTag(updateTagInput);
  }

  /**
   * Delete a tag (Admin only)
   */
  @Mutation(() => SuccessInfo)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteTag(@Args('id') id: string) {
    return this.productService.deleteTag(id);
  }

  /**
   * Create a new shop (Admin only)
   */
  @Mutation(() => Shop)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createShop(@Args('createShopInput') createShopInput: CreateShopInput) {
    return this.productService.createShop(createShopInput);
  }

  /**
   * Get all shops with pagination and filtering
   */
  @Query(() => GetShops, { name: 'shops' })
  async getShops(@Args('searchInput') searchInput: SearchInput) {
    return this.productService.findAllShops(searchInput);
  }

  /**
   * Get featured shops
   */
  @Query(() => [Shop], { name: 'featuredShops' })
  async getFeaturedShops() {
    return this.productService.getFeaturedShops();
  }

  /**
   * Get a shop by ID
   */
  @Query(() => Shop, { name: 'shop' })
  async getShopById(@Args('id') id: string) {
    return this.productService.findShopById(id);
  }

  /**
   * Update a shop (Admin only)
   */
  @Mutation(() => Shop)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateShop(@Args('updateShopInput') updateShopInput: UpdateShopInput) {
    return this.productService.updateShop(updateShopInput);
  }

  /**
   * Delete a shop (Admin only)
   */
  @Mutation(() => SuccessInfo)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteShop(@Args('id') id: string) {
    return this.productService.deleteShop(id);
  }

  /**
   * Create a new seller (User registration)
   */
  @Mutation(() => Seller)
  @UseGuards(AuthGuard)
  async createSeller(
    @Args('createSellerInput') createSellerInput: CreateSellerInput,
    @Context() context,
  ) {
    // In a real implementation, we would extract user ID from context
    // And check if user is trying to create a seller profile for themselves
    return this.productService.createSeller(createSellerInput);
  }

  /**
   * Get all sellers with pagination and filtering
   */
  @Query(() => GetProductSellers, { name: 'sellers' })
  async getSellers(@Args('searchInput') searchInput: SearchInput) {
    return this.productService.findAllSellers(searchInput);
  }

  /**
   * Get verified sellers
   */
  @Query(() => [Seller], { name: 'verifiedSellers' })
  async getVerifiedSellers() {
    return this.productService.getVerifiedSellers();
  }

  /**
   * Get a seller by ID
   */
  @Query(() => Seller, { name: 'seller' })
  async getSellerById(@Args('id') id: string) {
    return this.productService.findSellerById(id);
  }

  /**
   * Update a seller (Admin and Seller only)
   */
  @Mutation(() => Seller)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN', 'SELLER')
  async updateSeller(
    @Args('updateSellerInput') updateSellerInput: UpdateSellerInput,
    @Context() context,
  ) {
    // For a seller, we would check if they are updating their own profile
    // For an admin, they can update any seller
    return this.productService.updateSeller(updateSellerInput);
  }

  /**
   * Delete a seller (Admin only)
   */
  @Mutation(() => SuccessInfo)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteSeller(@Args('id') id: string) {
    return this.productService.deleteSeller(id);
  }

  /**
   * Create a new flash sale (Admin only)
   */
  @Mutation(() => Flash)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createFlash(
    @Args('createFlashInput') createFlashInput: CreateFlashInput,
  ) {
    return this.productService.createFlash(createFlashInput);
  }

  /**
   * Get all flash sales with pagination and filtering
   */
  @Query(() => GetFlashes, { name: 'flashes' })
  async getFlashes(@Args('searchInput') searchInput: SearchInput) {
    return this.productService.findAllFlashes(searchInput);
  }

  /**
   * Get active flash sales
   */
  @Query(() => [Flash], { name: 'activeFlashes' })
  async getActiveFlashes() {
    return this.productService.getActiveFlashes();
  }

  /**
   * Get a flash sale by ID
   */
  @Query(() => Flash, { name: 'flash' })
  async getFlashById(@Args('id') id: string) {
    return this.productService.findFlashById(id);
  }

  /**
   * Update a flash sale (Admin only)
   */
  @Mutation(() => Flash)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateFlash(
    @Args('updateFlashInput') updateFlashInput: UpdateFlashInput,
  ) {
    return this.productService.updateFlash(updateFlashInput);
  }

  /**
   * Delete a flash sale (Admin only)
   */
  @Mutation(() => SuccessInfo)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteFlash(@Args('id') id: string) {
    return this.productService.deleteFlash(id);
  }
}