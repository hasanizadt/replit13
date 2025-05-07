import { Module, Global } from '@nestjs/common';
import { ThrottlerModule as NestThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { LoggerService } from '../logger/logger.service';

@Global()
@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          ttl: configService.get<number>('THROTTLE_TTL', 60),
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        }]
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: 'THROTTLER_LOGGER',
      useFactory: (logger: LoggerService) => {
        logger.setContext('ThrottlerGuard');
        return (ip: string, path: string) => {
          logger.warn(`Rate limit exceeded: ${ip} - ${path}`);
        };
      },
      inject: [LoggerService],
    },
  ],
})
export class ThrottlerModule {}
