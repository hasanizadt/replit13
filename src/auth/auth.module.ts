import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from '../user/user.module';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { JwtStrategy } from './jwt.strategy';
import { CoreModule } from '../core/core.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CoreModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'hard!to-guess_secret',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtStrategy,
    AuthService,
    AuthResolver,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [JwtStrategy, AuthService],
})
export class AuthModule {}