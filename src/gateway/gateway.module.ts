import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';
import { WSAuthMiddleware } from './ws-auth.middleware';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerModule } from '../common/logger/logger.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwtExpiresIn'),
        },
      }),
    }),
  ],
  providers: [
    NotificationGateway,
    NotificationResolver,
    NotificationService,
    WSAuthMiddleware,
  ],
  exports: [NotificationService],
})
export class GatewayModule {}
