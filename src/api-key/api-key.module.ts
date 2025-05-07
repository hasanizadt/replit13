import { Module } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { ApiKeyResolver } from './api-key.resolver';
import { ApiKeyGuard } from './api-key.guard';
import { LoggerModule } from '../common/logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [
    CoreModule,
    LoggerModule, 
    AuthModule,
  ],
  providers: [ApiKeyService, ApiKeyResolver, ApiKeyGuard],
  exports: [ApiKeyService, ApiKeyGuard],
})
export class ApiKeyModule {}
