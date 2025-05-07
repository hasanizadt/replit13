import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    
    // Log the request when it's received
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);
    
    // Store start time
    const startTime = Date.now();

    // Log the response when it's sent
    response.on('finish', () => {
      const { statusCode } = response;
      const responseTime = Date.now() - startTime;
      
      if (statusCode >= 500) {
        this.logger.error(
          `${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${ip} - ${userAgent}`,
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${ip} - ${userAgent}`,
        );
      } else {
        this.logger.log(
          `${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${ip} - ${userAgent}`,
        );
      }
    });

    next();
  }
}
