import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('WsJwtGuard');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new WsException('Unauthorized access - No token provided');
      }

      // Verify the JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('app.jwtSecret'),
      });

      // Attach the user to the socket
      client['user'] = payload;
      
      return true;
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${error.message}`, error.stack);
      throw new WsException('Unauthorized access');
    }
  }
}
