import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookResolver } from './webhook.resolver';
import { LoggerModule } from '../common/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [
    CoreModule,
    LoggerModule, 
    ConfigModule, 
    AuthModule,
  ],
  providers: [WebhookService, WebhookResolver],
  exports: [WebhookService],
})
export class WebhookModule {}
