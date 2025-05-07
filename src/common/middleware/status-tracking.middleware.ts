import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { StatusTrackingService } from '../../status-tracking/status-tracking.service';

@Injectable()
export class StatusTrackingMiddleware implements NestMiddleware {
  constructor(private readonly statusTrackingService: StatusTrackingService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // This is a placeholder for actual implementation
    // In a real app, you would need to track mutations that change entity statuses
    // and capture the before/after state
    
    // The actual implementation depends on how your GraphQL mutations are structured
    // Here's a conceptual example:
    
    // For GraphQL, you would typically inject this into a resolver or use a custom decorator
    // You might also use a plugin or middleware specific to your GraphQL implementation
    
    // Example for capturing order status changes:
    /*
    if (req.body && req.body.query && req.body.query.includes('updateOrderStatus')) {
      const variables = req.body.variables;
      const originalOrder = await this.prismaService.order.findUnique({ 
        where: { id: variables.id } 
      });
      
      // Store the original status to compare after the request is complete
      req.originalOrderStatus = originalOrder.status;
      
      // Patch the response object to capture the updated order
      const originalEnd = res.end;
      res.end = function(...args) {
        // Check if the status changed
        if (req.updatedOrder && req.updatedOrder.status !== req.originalOrderStatus) {
          // Track the status change
          this.statusTrackingService.trackStatusChange(
            req.user.id, // The user who performed the change
            {
              entityType: 'ORDER',
              entityId: req.updatedOrder.id,
              fromStatus: req.originalOrderStatus,
              toStatus: req.updatedOrder.status,
              comment: variables.comment || null,
            },
            req.ip,
            req.headers['user-agent']
          );
        }
        
        originalEnd.apply(res, args);
      };
    }
    */
    
    next();
  }
}
