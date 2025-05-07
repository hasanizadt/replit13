import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('CacheService');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      return value || null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}: ${error.message}`, error.stack);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}: ${error.message}`, error.stack);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}: ${error.message}`, error.stack);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
    } catch (error) {
      this.logger.error(`Error resetting cache: ${error.message}`, error.stack);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cachedValue = await this.get<T>(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
