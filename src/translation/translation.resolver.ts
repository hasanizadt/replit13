import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { TranslationService } from './translation.service';
import { Translation, TranslationPagination, SupportedLanguage } from './models/translation.model';
import { 
  CreateTranslationInput, 
  UpdateTranslationInput, 
  GetTranslationsInput,
  SearchTranslationsInput,
  BulkTranslationInput,
} from './dto/translation.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Translation)
export class TranslationResolver {
  constructor(private readonly translationService: TranslationService) {}

  /**
   * Create a new translation (Admin only)
   */
  @Mutation(() => Translation)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createTranslation(
    @Args('input') input: CreateTranslationInput,
  ) {
    return this.translationService.createTranslation(input);
  }

  /**
   * Update an existing translation (Admin only)
   */
  @Mutation(() => Translation)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateTranslation(
    @Args('input') input: UpdateTranslationInput,
  ) {
    return this.translationService.updateTranslation(input);
  }

  /**
   * Delete a translation (Admin only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteTranslation(
    @Args('id') id: string,
  ) {
    return this.translationService.deleteTranslation(id);
  }

  /**
   * Get translations for an entity
   */
  @Query(() => [Translation])
  async getTranslations(
    @Args('input') input: GetTranslationsInput,
  ) {
    return this.translationService.getTranslations(input);
  }

  /**
   * Search translations (Admin only)
   */
  @Query(() => TranslationPagination)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async searchTranslations(
    @Args('input') input: SearchTranslationsInput,
  ) {
    return this.translationService.searchTranslations(input);
  }

  /**
   * Bulk create or update translations (Admin only)
   */
  @Mutation(() => [Translation])
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async bulkUpdateTranslations(
    @Args('input') input: BulkTranslationInput,
  ) {
    return this.translationService.bulkUpdateTranslations(input);
  }

  /**
   * Get supported languages
   */
  @Query(() => [SupportedLanguage])
  async getSupportedLanguages() {
    return this.translationService.getSupportedLanguages();
  }

  /**
   * Get translated field for an entity
   */
  @Query(() => String, { nullable: true })
  async getTranslatedField(
    @Args('entityType') entityType: string,
    @Args('entityId') entityId: string,
    @Args('field') field: string,
    @Args('language') language: string,
  ) {
    return this.translationService.getTranslatedField(entityType, entityId, field, language);
  }
}
