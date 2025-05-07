import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from './decorator/auth.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    let request;
    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest();
    } else {
      // GraphQL context
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET') || 'hard!to-guess_secret',
      });
      
      // Check if user exists and is not banned
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      if (user.isBanned) {
        throw new UnauthorizedException('Your account has been banned');
      }
      
      // Attach user info to request for use in controllers/resolvers
      request.user = {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    if (!request?.headers?.authorization) {
      return undefined;
    }
    
    const [type, token] = request.headers.authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}