
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ApiKeyService } from './api-key.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return false;
    }

    const result = await this.apiKeyService.validateApiKey({ 
      key: apiKey,
      requiredPermission: 'READ_PRODUCTS' 
    });

    return result.valid;
  }
}
