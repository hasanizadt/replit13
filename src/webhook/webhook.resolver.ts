import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { WebhookService } from './webhook.service';
import { 
  Webhook, 
  WebhookPagination, 
  WebhookWithSecret,
  WebhookLog,
  WebhookLogPagination
} from './models/webhook.model';
import { 
  CreateWebhookInput, 
  UpdateWebhookInput, 
  SearchWebhookInput,
  SearchWebhookLogInput,
  TriggerWebhookInput
} from './dto/webhook.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Webhook)
export class WebhookResolver {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Create a new webhook (User only)
   */
  @Mutation(() => WebhookWithSecret)
  @UseGuards(AuthGuard)
  async createWebhook(
    @Args('createWebhookInput') createWebhookInput: CreateWebhookInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.webhookService.createWebhook(userId, createWebhookInput);
  }

  /**
   * Get user's webhooks (User only)
   */
  @Query(() => WebhookPagination)
  @UseGuards(AuthGuard)
  async getMyWebhooks(
    @Args('searchInput') searchInput: SearchWebhookInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.webhookService.getUserWebhooks(userId, searchInput);
  }

  /**
   * Get a webhook by ID (User only)
   */
  @Query(() => Webhook)
  @UseGuards(AuthGuard)
  async getWebhookById(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.webhookService.getWebhookById(userId, id);
  }

  /**
   * Update a webhook (User only)
   */
  @Mutation(() => Webhook)
  @UseGuards(AuthGuard)
  async updateWebhook(
    @Args('updateWebhookInput') updateWebhookInput: UpdateWebhookInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.webhookService.updateWebhook(userId, updateWebhookInput);
  }

  /**
   * Delete a webhook (User only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async deleteWebhook(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.webhookService.deleteWebhook(userId, id);
  }

  /**
   * Refresh a webhook's secret key (User only)
   */
  @Mutation(() => WebhookWithSecret)
  @UseGuards(AuthGuard)
  async refreshWebhookSecret(
    @Args('id') id: string,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.webhookService.refreshWebhookSecret(userId, id);
  }

  /**
   * Get webhook delivery logs (User only)
   */
  @Query(() => WebhookLogPagination)
  @UseGuards(AuthGuard)
  async getWebhookLogs(
    @Args('searchInput') searchInput: SearchWebhookLogInput,
    @Context() context,
  ) {
    const userId = context.req.user.id;
    return this.webhookService.getWebhookLogs(userId, searchInput);
  }

  /**
   * Trigger webhooks for testing (Admin only)
   */
  @Mutation(() => Boolean)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async triggerWebhook(
    @Args('triggerWebhookInput') triggerWebhookInput: TriggerWebhookInput,
  ) {
    return this.webhookService.triggerWebhooks(triggerWebhookInput);
  }
}
