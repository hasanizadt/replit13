import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MonitoringService } from './monitoring.service';

@Injectable()
export class MonitoringMiddleware implements NestMiddleware {
  constructor(private readonly monitoringService: MonitoringService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    // Track response
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      this.monitoringService.trackRequest(res.statusCode, responseTime);
    });
    
    next();
  }
}
