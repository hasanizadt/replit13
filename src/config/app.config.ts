import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  name: process.env.APP_NAME || 'E-Commerce Platform',
  url: process.env.APP_URL || 'http://localhost:3000',
  version: process.env.APP_VERSION || '1.0.0',
  isProduction: process.env.NODE_ENV === 'production',
  secret: process.env.APP_SECRET,
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Throttling (Rate Limiting)
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
  
  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 3600, // 1 hour
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || 30,
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },
}));
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
