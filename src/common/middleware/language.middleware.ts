import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

/**
 * Middleware to detect and set user language preference
 */
@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  private defaultLanguage: string;
  private supportedLanguages: string[];

  constructor(private readonly configService: ConfigService) {
    this.defaultLanguage = this.configService.get<string>('app.i18n.fallbackLanguage', 'en');
    this.supportedLanguages = this.configService.get<string[]>('app.i18n.supportedLanguages', ['en', 'fa', 'ar']);
  }

  use(req: Request, res: Response, next: NextFunction) {
    let lang: string;

    // Check if the language is specified in the header
    const headerLang = req.header('Accept-Language');
    if (headerLang) {
      const preferredLang = this.parseLanguageHeader(headerLang);
      if (preferredLang && this.isLanguageSupported(preferredLang)) {
        lang = preferredLang;
      }
    }

    // Check if the language is specified in the query string
    if (!lang && req.query.lang) {
      const queryLang = String(req.query.lang);
      if (this.isLanguageSupported(queryLang)) {
        lang = queryLang;
      }
    }

    // Set to default language if not determined yet
    if (!lang) {
      lang = this.defaultLanguage;
    }

    // Store the language in request for later use
    req['language'] = lang;

    next();
  }

  /**
   * Parse the Accept-Language header to get the most preferred language
   */
  private parseLanguageHeader(header: string): string | null {
    try {
      // Parse Accept-Language header value like 'en-US,en;q=0.9,fa;q=0.8'
      const languages = header.split(',').map(lang => {
        const [language, qValue] = lang.trim().split(';q=');
        return {
          language: language.split('-')[0].toLowerCase(), // Get primary language tag
          quality: qValue ? parseFloat(qValue) : 1.0,
        };
      });

      // Sort by quality value, highest first
      languages.sort((a, b) => b.quality - a.quality);

      // Return the highest quality language
      return languages.length > 0 ? languages[0].language : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if a language is supported
   */
  private isLanguageSupported(lang: string): boolean {
    return this.supportedLanguages.includes(lang.toLowerCase());
  }
}
