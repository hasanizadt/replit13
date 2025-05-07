import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class WSAuthMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('WSAuthMiddleware');
  }

  async resolve(socket: Socket, next: (err?: Error) => void) {
    try {
      const token = this.extractTokenFromHandshake(socket);
      
      if (!token) {
        return next(new Error('Authentication token is missing'));
      }
      
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('app.jwtSecret'),
      });
      
      // Get user from database to ensure they still exist and have the same role
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          role: true,
          status: true,
        },
      });
      
      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('User not found or inactive'));
      }
      
      // Attach user to socket
      socket.data.user = user;
      
      next();
    } catch (error) {
      this.logger.error(`WebSocket authentication error: ${error.message}`, error.stack);
      next(new Error('Authentication error'));
    }
  }

  private extractTokenFromHandshake(socket: Socket): string | undefined {
    const handshake = socket.handshake;
    
    // Try to get the token from the auth query parameter
    if (handshake.query && handshake.query.token) {
      return handshake.query.token as string;
    }
    
    // Try to get the token from the authorization header
    if (handshake.headers && handshake.headers.authorization) {
      const auth = handshake.headers.authorization as string;
      const parts = auth.split(' ');
      
      if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
      }
    }
    
    return undefined;
  }
}
