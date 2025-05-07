import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { validationSchema } from './validation.schema';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
      validationOptions: {
        abortEarly: false,
      },
      expandVariables: true,
      envFilePath: ['.env', '.env.local', `.env.${process.env.NODE_ENV}`],
    }),
  ],
})
export class ConfigModule {}
