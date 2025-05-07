import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';
import { CreateApiKeyInput, UpdateApiKeyInput, SearchApiKeyInput, ValidateApiKeyInput } from './dto/api-key.input';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('ApiKeyService');
  }

  /**
   * Generate a new API key
   */
  private generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a new API key
   */
  async createApiKey(userId: string, data: CreateApiKeyInput) {
    try {
      const key = this.generateApiKey();

      const apiKey = await this.prisma.apiKey.create({
        data: {
          user: { connect: { id: userId } },
          name: data.name,
          key,
          secretKey: key, // Added missing secretKey field
          permissions: data.permissions,
          expiresAt: data.expiresAt,
          isActive: true,
        },
      });

      // Return both the API key and the newly created record
      return {
        apiKey,
        secretKey: key,
      };
    } catch (error) {
      this.logger.error(`Error creating API key: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user's API keys with pagination and filtering
   */
  async getUserApiKeys(userId: string, searchInput: SearchApiKeyInput) {
    try {
      const { page, limit, search, isActive, permission, expired } = searchInput;
      const skip = (page - 1) * limit;

      const where: any = {
        userId,
      };

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (permission) {
        where.permissions = {
          has: permission,
        };
      }

      if (expired === true) {
        where.expiresAt = {
          lt: new Date(),
        };
      } else if (expired === false) {
        where.OR = [
          {
            expiresAt: {
              gt: new Date(),
            },
          },
          {
            expiresAt: null,
          },
        ];
      }

      const [apiKeys, totalCount] = await Promise.all([
        this.prisma.apiKey.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.apiKey.count({ where }),
      ]);

      // Mask the actual keys for security
      const maskedApiKeys = apiKeys.map(key => ({
        ...key,
        key: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 8)}`,
      }));

      return {
        apiKeys: maskedApiKeys,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      this.logger.error(`Error getting user API keys: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get an API key by ID
   */
  async getApiKeyById(userId: string, id: string) {
    try {
      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!apiKey) {
        throw new Error('API key not found');
      }

      // Mask the actual key for security
      return {
        ...apiKey,
        key: `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 8)}`,
      };
    } catch (error) {
      this.logger.error(`Error getting API key by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update an API key
   */
  async updateApiKey(userId: string, data: UpdateApiKeyInput) {
    try {
      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          id: data.id,
          userId,
        },
      });

      if (!apiKey) {
        throw new Error('API key not found');
      }

      const updateData: any = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (data.permissions !== undefined) {
        updateData.permissions = data.permissions;
      }

      if (data.expiresAt !== undefined) {
        updateData.expiresAt = data.expiresAt;
      }

      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }

      const updatedApiKey = await this.prisma.apiKey.update({
        where: { id: data.id },
        data: updateData,
      });

      // Mask the actual key for security
      return {
        ...updatedApiKey,
        key: `${updatedApiKey.key.substring(0, 8)}...${updatedApiKey.key.substring(updatedApiKey.key.length - 8)}`,
      };
    } catch (error) {
      this.logger.error(`Error updating API key: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(userId: string, id: string) {
    try {
      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!apiKey) {
        throw new Error('API key not found');
      }

      await this.prisma.apiKey.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      this.logger.error(`Error deleting API key: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Refresh an API key (generate a new key)
   */
  async refreshApiKey(userId: string, id: string) {
    try {
      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!apiKey) {
        throw new Error('API key not found');
      }

      const newKey = this.generateApiKey();

      const updatedApiKey = await this.prisma.apiKey.update({
        where: { id },
        data: {
          key: newKey,
          updatedAt: new Date(),
        },
      });

      // Return both the new API key and the updated record
      return {
        apiKey: updatedApiKey,
        secretKey: newKey,
      };
    } catch (error) {
      this.logger.error(`Error refreshing API key: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate an API key and check for required permissions
   */
  async validateApiKey(data: ValidateApiKeyInput) {
    try {
      const { key, requiredPermission } = data;

      const apiKey = await this.prisma.apiKey.findFirst({
        where: {
          key,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!apiKey) {
        return {
          valid: false,
          message: 'Invalid API key',
        };
      }

      // Check if the key has expired
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return {
          valid: false,
          message: 'API key has expired',
        };
      }

      // Check if the user is active
      if (!apiKey.user.isActive) {
        return {
          valid: false,
          message: 'User is inactive',
        };
      }

      // Check if the key has the required permission
      // Using Array.isArray to handle JSON properly
      const permissions = Array.isArray(apiKey.permissions) 
        ? apiKey.permissions 
        : JSON.parse(apiKey.permissions as string);
      
      if (!permissions.includes(requiredPermission)) {
        return {
          valid: false,
          message: `API key does not have the required permission: ${requiredPermission}`,
        };
      }

      // Update last used timestamp
      await this.prisma.apiKey.update({
        where: { id: apiKey.id },
        data: {
          lastUsedAt: new Date(),
        },
      });

      return {
        valid: true,
        userId: apiKey.userId,
        userRole: apiKey.user.role,
      };
    } catch (error) {
      this.logger.error(`Error validating API key: ${error.message}`, error.stack);
      return {
        valid: false,
        message: 'Error validating API key',
      };
    }
  }
}