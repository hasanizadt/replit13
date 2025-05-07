import { ValidationPipe, ValidationError, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

export class I18nValidationPipe extends ValidationPipe {
  constructor(private readonly i18n: I18nService) {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new BadRequestException(this.formatErrors(errors));
      },
    });
  }

  private formatErrors(errors: ValidationError[], parentKey = '') {
    return errors.flatMap((error) => {
      const key = parentKey ? `${parentKey}.${error.property}` : error.property;

      if (error.children && error.children.length > 0) {
        return this.formatErrors(error.children, key);
      }

      const constraints = error.constraints || {};

      return Object.entries(constraints).map(([constraint, message]) => {
        // Try to find a translation key for this constraint
        const translationKey = `validation.${constraint}`;
        const hasTranslation = this.i18n.translate(translationKey, { 
          lang: 'en' 
        }) !== translationKey;

        // If no translation is found, return the original message
        if (!hasTranslation) {
          return {
            property: key,
            constraint,
            message,
          };
        }

        // Create context object with possible variables
        const context: any = {
          property: key,
        };

        // Add constraint-specific variables
        if (['min', 'minLength'].includes(constraint)) {
          context.min = error.constraints[constraint].match(/(\d+)/)?.[0];
        }

        if (['max', 'maxLength'].includes(constraint)) {
          context.max = error.constraints[constraint].match(/(\d+)/)?.[0];
        }

        // Add array constraints
        if (['arrayMinSize', 'arrayMaxSize'].includes(constraint) && error.constraints[constraint]) {
          context.size = error.constraints[constraint].match(/(\d+)/)?.[0];
        }

        return {
          property: key,
          constraint,
          message: this.i18n.translate(`errors.validation.${constraint}`, { 
            lang: 'en',
            args: context 
          }),
        };
      });
    });
  }
}