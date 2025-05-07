import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule as NestI18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    NestI18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get('app.i18n.fallbackLanguage', 'en'),
        loaderOptions: {
          path: path.join(process.cwd(), 'src/i18n/translations/'),
          watch: configService.get('app.isDevelopment', true),
        },
        typesOutputPath: path.join(process.cwd(), 'dist/i18n-generated/i18n.generated.ts'),
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale', 'l'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
    }),
  ],
})
export class I18nModule {}
