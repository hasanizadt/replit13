import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { SuccessInfo } from '../common/models/success.model';
import { CategoryService } from './category.service';
import { 
  Category, 
  MainCategory, 
  SubCategory, 
  GetCategories, 
  GetMainCategories, 
  GetSubCategories 
} from './models/category.model';
import { CreateMainCategoryInput } from './dto/create-main-category.input';
import { UpdateMainCategoryInput } from './dto/update-main-category.input';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { CreateSubCategoryInput } from './dto/create-sub-category.input';
import { UpdateSubCategoryInput } from './dto/update-sub-category.input';
import { SearchInput } from '../shared/dto/search.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/decorator/auth.decorator';

@Resolver()
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Create a main category (Admin only)
   */
  @Mutation(() => MainCategory)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createMainCategory(
    @Args('createMainCategoryInput') createMainCategoryInput: CreateMainCategoryInput,
  ) {
    return this.categoryService.createMainCategory(createMainCategoryInput);
  }

  /**
   * Get all main categories with pagination and filtering
   */
  @Query(() => GetMainCategories)
  @Public()
  async getMainCategories(@Args('searchInput') searchInput: SearchInput) {
    return this.categoryService.findAllMainCategories(searchInput);
  }

  /**
   * Get a main category by ID
   */
  @Query(() => MainCategory)
  @Public()
  async getMainCategoryById(@Args('id') id: string) {
    return this.categoryService.findMainCategoryById(id);
  }

  /**
   * Get a main category by slug
   */
  @Query(() => MainCategory)
  @Public()
  async getMainCategoryBySlug(@Args('slug') slug: string) {
    return this.categoryService.findMainCategoryBySlug(slug);
  }

  /**
   * Get featured main categories
   */
  @Query(() => [MainCategory])
  @Public()
  async getFeaturedMainCategories() {
    return this.categoryService.getFeaturedMainCategories(); // Fixed method name
  }

  /**
   * Update a main category (Admin only)
   */
  @Mutation(() => MainCategory)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateMainCategory(
    @Args('updateMainCategoryInput') updateMainCategoryInput: UpdateMainCategoryInput,
  ) {
    return this.categoryService.updateMainCategory(updateMainCategoryInput);
  }

  /**
   * Delete a main category (Admin only)
   */
  @Mutation(() => SuccessInfo) // Updated return type
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteMainCategory(@Args('id') id: string) {
    return this.categoryService.deleteMainCategory(id);
  }

  /**
   * Create a category (Admin only)
   */
  @Mutation(() => Category)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoryService.createCategory(createCategoryInput);
  }

  /**
   * Get all categories with pagination and filtering
   */
  @Query(() => GetCategories)
  @Public()
  async getCategories(@Args('searchInput') searchInput: SearchInput) {
    return this.categoryService.findAllCategories(searchInput);
  }

  /**
   * Get categories by main category ID
   */
  @Query(() => GetCategories)
  @Public()
  async getCategoriesByMainCategoryId(
    @Args('mainCategoryId') mainCategoryId: string,
    @Args('searchInput', { nullable: true }) searchInput?: SearchInput
  ) {
    return this.categoryService.getCategoriesByMainCategoryId(
      mainCategoryId, 
      searchInput || { page: 1, limit: 100 }
    );
  }

  /**
   * Get a category by ID
   */
  @Query(() => Category)
  @Public()
  async getCategoryById(@Args('id') id: string) {
    return this.categoryService.findCategoryById(id);
  }

  /**
   * Get a category by slug
   */
  @Query(() => Category)
  @Public()
  async getCategoryBySlug(@Args('slug') slug: string) {
    return this.categoryService.findCategoryBySlug(slug);
  }

  /**
   * Get featured categories
   */
  @Query(() => [Category])
  @Public()
  async getFeaturedCategories() {
    return this.categoryService.getFeaturedCategories(); // Fixed method name
  }

  /**
   * Update a category (Admin only)
   */
  @Mutation(() => Category)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateCategory(
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ) {
    return this.categoryService.updateCategory(updateCategoryInput);
  }

  /**
   * Delete a category (Admin only)
   */
  @Mutation(() => SuccessInfo) // Updated return type
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteCategory(@Args('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }

  /**
   * Create a sub-category (Admin only)
   */
  @Mutation(() => SubCategory)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createSubCategory(
    @Args('createSubCategoryInput') createSubCategoryInput: CreateSubCategoryInput,
  ) {
    return this.categoryService.createSubCategory(createSubCategoryInput);
  }

  /**
   * Get all sub-categories with pagination and filtering
   */
  @Query(() => GetSubCategories)
  @Public()
  async getSubCategories(@Args('searchInput') searchInput: SearchInput) {
    return this.categoryService.findAllSubCategories(searchInput);
  }

  /**
   * Get sub-categories by category ID
   */
  @Query(() => GetSubCategories)
  @Public()
  async getSubCategoriesByCategoryId(
    @Args('categoryId') categoryId: string,
    @Args('searchInput', { nullable: true }) searchInput?: SearchInput
  ) {
    return this.categoryService.getSubCategoriesByCategoryId(
      categoryId, 
      searchInput || { page: 1, limit: 100 }
    );
  }

  /**
   * Get a sub-category by ID
   */
  @Query(() => SubCategory)
  @Public()
  async getSubCategoryById(@Args('id') id: string) {
    return this.categoryService.findSubCategoryById(id);
  }

  /**
   * Get a sub-category by slug
   */
  @Query(() => SubCategory)
  @Public()
  async getSubCategoryBySlug(@Args('slug') slug: string) {
    return this.categoryService.findSubCategoryBySlug(slug);
  }

  /**
   * Get featured sub-categories
   */
  @Query(() => [SubCategory])
  @Public()
  async getFeaturedSubCategories() {
    return this.categoryService.getFeaturedSubCategories(); // Fixed method name
  }

  /**
   * Update a sub-category (Admin only)
   */
  @Mutation(() => SubCategory)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateSubCategory(
    @Args('updateSubCategoryInput') updateSubCategoryInput: UpdateSubCategoryInput,
  ) {
    return this.categoryService.updateSubCategory(updateSubCategoryInput);
  }

  /**
   * Delete a sub-category (Admin only)
   */
  @Mutation(() => SuccessInfo) // Updated return type
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteSubCategory(@Args('id') id: string) {
    return this.categoryService.deleteSubCategory(id);
  }
}