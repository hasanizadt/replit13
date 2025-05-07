import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { 
  CreateWebhookInput, 
  UpdateWebhookInput, 
  SearchWebhookInput,
  SearchWebhookLogInput,
  TriggerWebhookInput
} from './dto/webhook.input';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class WebhookService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext('WebhookService');
  }

  /**
   * Generate a webhook secret key
   */
  private generateSecretKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a signature for webhook payload
   */
  private generateSignature(payload: string, secretKey: string): string {
    return crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');
  }

  /**
   * Create a new webhook
   */
  async createWebhook(userId: string, data: CreateWebhookInput) {
    try {
      const secretKey = this.generateSecretKey();

      const webhook = await this.prisma.webhook.create({
        data: {
          userId,
          name: data.name,
          url: data.url,
          events: data.events,
          secretKey,
          isActive: true,
        },
      });

      // Return both the webhook and the newly created secret key
      return {
        webhook: {
          ...webhook,
          secretKey: `${webhook.secretKey.substring(0, 8)}...`,
        },
        secretKey,
      };
    } catch (error) {
      this.logger.error(`Error creating webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user's webhooks with pagination and filtering
   */
  async getUserWebhooks(userId: string, searchInput: SearchWebhookInput) {
    try {
      const { page, limit, search, isActive, event } = searchInput;
      const skip = (page - 1) * limit;

      const where: any = {
        userId,
      };

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            url: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (event) {
        where.events = {
          array_contains: event,
        };
      }

      const [webhooks, totalCount] = await Promise.all([
        this.prisma.webhook.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.webhook.count({ where }),
      ]);

      // Mask the secret keys
      const maskedWebhooks = webhooks.map(webhook => ({
        ...webhook,
        secretKey: `${webhook.secretKey.substring(0, 8)}...`,
      }));

      return {
        webhooks: maskedWebhooks,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      this.logger.error(`Error getting user webhooks: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a webhook by ID
   */
  async getWebhookById(userId: string, id: string) {
    try {
      const webhook = await this.prisma.webhook.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!webhook) {
        throw new Error('Webhook not found');
      }

      // Mask the secret key
      return {
        ...webhook,
        secretKey: `${webhook.secretKey.substring(0, 8)}...`,
      };
    } catch (error) {
      this.logger.error(`Error getting webhook by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a webhook
   */
  async updateWebhook(userId: string, data: UpdateWebhookInput) {
    try {
      const webhook = await this.prisma.webhook.findFirst({
        where: {
          id: data.id,
          userId,
        },
      });

      if (!webhook) {
        throw new Error('Webhook not found');
      }

      const updateData: any = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (data.url !== undefined) {
        updateData.url = data.url;
      }

      if (data.events !== undefined) {
        updateData.events = data.events;
      }

      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;

        // If re-enabling a webhook, reset the failure count
        if (data.isActive === true) {
          updateData.failureCount = 0;
        }
      }

      const updatedWebhook = await this.prisma.webhook.update({
        where: { id: data.id },
        data: updateData,
      });

      // Mask the secret key
      return {
        ...updatedWebhook,
        secretKey: `${updatedWebhook.secretKey.substring(0, 8)}...`,
      };
    } catch (error) {
      this.logger.error(`Error updating webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(userId: string, id: string) {
    try {
      const webhook = await this.prisma.webhook.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!webhook) {
        throw new Error('Webhook not found');
      }

      await this.prisma.webhook.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(`Error deleting webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Refresh a webhook's secret key
   */
  async refreshWebhookSecret(userId: string, id: string) {
    try {
      const webhook = await this.prisma.webhook.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!webhook) {
        throw new Error('Webhook not found');
      }

      const newSecretKey = this.generateSecretKey();

      const updatedWebhook = await this.prisma.webhook.update({
        where: { id },
        data: {
          secretKey: newSecretKey,
          updatedAt: new Date(),
        },
      });

      // Return both the webhook and the new secret key
      return {
        webhook: {
          ...updatedWebhook,
          secretKey: `${updatedWebhook.secretKey.substring(0, 8)}...`,
        },
        secretKey: newSecretKey,
      };
    } catch (error) {
      this.logger.error(`Error refreshing webhook secret: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get webhook delivery logs
   */
  async getWebhookLogs(userId: string, searchInput: SearchWebhookLogInput) {
    try {
      const { webhookId, event, success, page, limit } = searchInput;
      const skip = (page - 1) * limit;

      // Verify the webhook belongs to the user
      const webhook = await this.prisma.webhook.findFirst({
        where: {
          id: webhookId,
          userId,
        },
      });

      if (!webhook) {
        throw new Error('Webhook not found');
      }

      const where: any = {
        webhookId,
      };

      if (event) {
        where.event = event;
      }

      if (success !== undefined) {
        where.success = success;
      }

      const [logs, totalCount] = await Promise.all([
        this.prisma.webhookLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.webhookLog.count({ where }),
      ]);

      return {
        logs,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      this.logger.error(`Error getting webhook logs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Trigger webhooks for a specific event
   */
  async triggerWebhooks(eventData: TriggerWebhookInput) {
    try {
      const { event, payload } = eventData;

      // Find all active webhooks that are subscribed to this event
      const webhooks = await this.prisma.webhook.findMany({
        where: {
          isActive: true,
          events: {
            array_contains: event,
          },
          failureCount: {
            lt: 10, // Only consider webhooks that haven't failed too many times
          },
        },
      });

      if (webhooks.length === 0) {
        this.logger.log(`No active webhooks found for event: ${event}`);
        return true;
      }

      // Send the webhook to each subscriber
      const calls = webhooks.map(webhook => this.callWebhook(webhook, event, payload));
      await Promise.all(calls);

      return true;
    } catch (error) {
      this.logger.error(`Error triggering webhooks: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Call a webhook endpoint
   */
  private async callWebhook(webhook: any, event: string, payload: string) {
    const startTime = Date.now();
    let success = false;
    let statusCode = null;
    let response = null;
    let error = null;
    let executionMs = null;

    try {
      // Generate signature
      const signature = this.generateSignature(payload, webhook.secretKey);
      const timestamp = Date.now().toString();

      // Make the HTTP request
      const result = await axios.post(
        webhook.url,
        { event, payload: JSON.parse(payload) },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Timestamp': timestamp,
            'X-Webhook-Event': event,
            'User-Agent': 'E-Commerce-Platform-Webhook',
          },
          timeout: 10000, // 10 seconds timeout
        },
      );

      success = true;
      statusCode = result.status;
      response = JSON.stringify(result.data).substring(0, 1000); // Truncate very long responses
      executionMs = Date.now() - startTime;

      // Update webhook's last called time
      await this.prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          lastCalledAt: new Date(),
          failureCount: 0, // Reset failure count on success
        },
      });
    } catch (err) {
      success = false;
      error = err.message;
      executionMs = Date.now() - startTime;

      if (err.response) {
        statusCode = err.response.status;
        response = JSON.stringify(err.response.data).substring(0, 1000);
      }

      // Update webhook with failure information
      await this.prisma.webhook.update({
        where: { id: webhook.id },
        data: {
          lastFailedAt: new Date(),
          failureCount: {
            increment: 1,
          },
          // Automatically disable webhook after too many failures
          isActive: webhook.failureCount >= 9 ? false : webhook.isActive,
        },
      });

      this.logger.warn(
        `Webhook call failed: ${webhook.id}, URL: ${webhook.url}, Error: ${error}`,
      );
    }

    // Log the webhook call
    await this.prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event,
        payload,
        statusCode,
        response,
        success,
        error,
        executionMs,
      },
    });
  }
}