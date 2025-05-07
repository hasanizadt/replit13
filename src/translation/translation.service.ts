import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { 
  CreateTranslationInput, 
  UpdateTranslationInput, 
  GetTranslationsInput,
  SearchTranslationsInput,
  BulkTranslationInput,
} from './dto/translation.input';

@Injectable()
export class TranslationService {
  private readonly supportedLanguages: string[];
  private readonly defaultLanguage: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.logger.setContext('TranslationService');
    this.supportedLanguages = this.configService.get('app.i18n.supportedLanguages', ['en', 'fa', 'ar']);
    this.defaultLanguage = this.configService.get('app.i18n.fallbackLanguage', 'en');
  }

  /**
   * Create a new translation
   */
  async createTranslation(input: CreateTranslationInput) {
    try {
      // Check if translation already exists
      const existingTranslation = await (this.prisma as any).translation.findFirst({
        where: {
          entityType: input.entityType,
          entityId: input.entityId,
          fieldName: input.field,
          language: input.language,
        },
      });

      if (existingTranslation) {
        // Update the existing translation
        return (this.prisma as any).translation.update({
          where: { id: existingTranslation.id },
          data: { value: input.value },
        });
      }

      // Create a new translation
      return (this.prisma as any).translation.create({
        data: {
          entityType: input.entityType,
          entityId: input.entityId,
          fieldName: input.field,
          language: input.language,
          value: input.value,
        },
      });
    } catch (error) {
      this.logger.error(`Error creating translation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an existing translation
   */
  async updateTranslation(input: UpdateTranslationInput) {
    try {
      return (this.prisma as any).translation.update({
        where: { id: input.id },
        data: { value: input.value },
      });
    } catch (error) {
      this.logger.error(`Error updating translation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a translation
   */
  async deleteTranslation(id: string) {
    try {
      await (this.prisma as any).translation.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      this.logger.error(`Error deleting translation: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get translations for an entity
   */
  async getTranslations(input: GetTranslationsInput) {
    try {
      const where: any = {
        entityType: input.entityType,
        entityId: input.entityId,
      };

      if (input.field) {
        where.fieldName = input.field;
      }

      if (input.language) {
        where.language = input.language;
      }

      return (this.prisma as any).translation.findMany({
        where,
        orderBy: [
          { value: 'asc' },
          { createdAt: 'asc' },
        ],
      });
    } catch (error) {
      this.logger.error(`Error getting translations: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Search translations
   */
  async searchTranslations(input: SearchTranslationsInput) {
    try {
      const { page, limit, entityType, language, search } = input;
      const skip = (page - 1) * limit;

      // Build the where clause
      const where: any = {};

      if (entityType) {
        where.entityType = entityType;
      }

      if (language) {
        where.language = language;
      }

      if (search) {
        where.OR = [
          { value: { contains: search, mode: "insensitive" as const } },
        ];
      }

      // Get translations with pagination
      const [translations, totalCount] = await Promise.all([
        (this.prisma as any).translation.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { entityType: 'asc' },
            { fieldName: 'asc' },
            { value: 'asc' },
            { createdAt: 'asc' },
          ],
        }),
        (this.prisma as any).translation.count({ where }),
      ]);

      return {
        translations,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      this.logger.error(`Error searching translations: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Bulk create or update translations
   */
  async bulkUpdateTranslations(input: BulkTranslationInput) {
    try {
      const results = [];

      for (const item of input.translations) {
        // Check if translation already exists
        const existingTranslation = await (this.prisma as any).translation.findFirst({
          where: {
            entityType: input.entityType,
            entityId: input.entityId,
            fieldName: item.field,
            language: item.language,
          },
        });

        if (existingTranslation) {
          // Update the existing translation
          const updated = await (this.prisma as any).translation.update({
            where: { id: existingTranslation.id },
            data: { value: item.value },
          });
          results.push(updated);
        } else {
          // Create a new translation
          const created = await (this.prisma as any).translation.create({
            data: {
              entityType: input.entityType,
              entityId: input.entityId,
              fieldName: item.field,
              language: item.language,
              value: item.value,
            },
          });
          results.push(created);
        }
      }

      return results;
    } catch (error) {
      this.logger.error(`Error bulk updating translations: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    const languages = [
      { code: 'en', name: 'English', isDefault: this.defaultLanguage === 'en', isActive: true },
      { code: 'fa', name: 'Persian', isDefault: this.defaultLanguage === 'fa', isActive: true },
      { code: 'ar', name: 'Arabic', isDefault: this.defaultLanguage === 'ar', isActive: true },
    ];

    // Filter to only include configured supported languages
    return languages.filter(lang => this.supportedLanguages.includes(lang.code));
  }

  /**
   * Get translated field for an entity
   */
  async getTranslatedField(entityType: string, entityId: string, field: string, language: string) {
    try {
      // Try to get the translation for the requested language
      const translation = await (this.prisma as any).translation.findFirst({
        where: {
          entityType,
          entityId,
          fieldName: field,
          language,
        },
      });

      if (translation) {
        return translation.value;
      }

      // If no translation found for requested language, try the default language
      if (language !== this.defaultLanguage) {
        const defaultTranslation = await (this.prisma as any).translation.findFirst({
          where: {
            entityType,
            entityId,
            fieldName: field,
            language: this.defaultLanguage,
          },
        });

        if (defaultTranslation) {
          return defaultTranslation.value;
        }
      }

      // If still no translation found, return null
      return null;
    } catch (error) {
      this.logger.error(`Error getting translated field: ${error.message}`, error.stack);
      throw error;
    }
  }
}