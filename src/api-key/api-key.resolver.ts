import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ApiKeyService } from './api-key.service';
import { ApiKey, ApiKeyPagination, ApiKeyWithSecret } from './models/api-key.model';
import { CreateApiKeyInput, UpdateApiKeyInput, SearchApiKeyInput } from './dto/api-key.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => ApiKey)
export class ApiKeyResolver {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  /**
   * Create a new API key (User or Admin)
   */
  @Mutation(() => ApiKeyWithSecret)
  @UseGuards(AuthGuard)
  async createApiKey(
    @Args('createApiKeyInput') createApiKeyInput: CreateApiKeyInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.apiKeyService.createApiKey(userId, createApiKeyInput);
  }

  /**
   * Get user's API keys (User only)
   */
  @Query(() => ApiKeyPagination)
  @UseGuards(AuthGuard)
  async getMyApiKeys(
    @Args('searchInput') searchInput: SearchApiKeyInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.apiKeyService.getUserApiKeys(userId, searchInput);
  }

  /**
   * Get an API key by ID (User only)
   */
  @Query(() => ApiKey)
  @UseGuards(AuthGuard)
  async getApiKeyById(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.apiKeyService.getApiKeyById(userId, id);
  }

  /**
   * Update an API key (User only)
   */
  @Mutation(() => ApiKey)
  @UseGuards(AuthGuard)
  async updateApiKey(
    @Args('updateApiKeyInput') updateApiKeyInput: UpdateApiKeyInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.apiKeyService.updateApiKey(userId, updateApiKeyInput);
  }

  /**
   * Delete an API key (User only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteApiKey(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.apiKeyService.deleteApiKey(userId, id);
  }

  /**
   * Refresh an API key (User only)
   */
  @Mutation(() => ApiKeyWithSecret)
  @UseGuards(AuthGuard)
  async refreshApiKey(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.apiKeyService.refreshApiKey(userId, id);
  }
}
