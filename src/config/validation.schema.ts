import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  
  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  
  // Database
  DATABASE_URL: Joi.string().required(),
  
  // Redis (optional)
  USE_REDIS: Joi.boolean().default(false),
  REDIS_HOST: Joi.string().when('USE_REDIS', {
    is: true,
    then: Joi.required(),
  }),
  REDIS_PORT: Joi.number().when('USE_REDIS', {
    is: true,
    then: Joi.required(),
  }),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  
  // Caching
  USE_REDIS_CACHE: Joi.boolean().default(false),
  CACHE_TTL: Joi.number().default(1800),
  CACHE_MAX_ITEMS: Joi.number().default(1000),
  
  // Throttling
  USE_REDIS_THROTTLER: Joi.boolean().default(false),
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  
  // Monitoring
  MONITORING_ENABLED: Joi.boolean().default(true),
  MONITORING_INTERVAL: Joi.number().default(60),
  MEMORY_ALERT_THRESHOLD: Joi.number().min(0).max(1).default(0.9),
  CPU_ALERT_THRESHOLD: Joi.number().min(0).max(1).default(0.8),
  // Reporting
  REPORTS_DIR: Joi.string().default('./reports'),
  MAX_REPORT_AGE: Joi.number().default(30),
  ENABLE_SCHEDULED_REPORTS: Joi.boolean().default(false),

  DISK_ALERT_THRESHOLD: Joi.number().min(0).max(1).default(0.9),

  // Scheduling
  ENABLE_SCHEDULING: Joi.boolean().default(true),
  
  // Security
  BCRYPT_SALT_ROUNDS: Joi.number().default(10),
  CORS_ENABLED: Joi.boolean().default(true),
  CORS_ORIGINS: Joi.string().default('*'),
  CSRF_ENABLED: Joi.boolean().default(false),
  RATE_LIMIT_ENABLED: Joi.boolean().default(true),
  ALLOWED_HOSTS: Joi.string().optional(),
});
