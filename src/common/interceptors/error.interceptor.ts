import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GraphQLError } from 'graphql';
import { Prisma } from '@prisma/client';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('ErrorInterceptor');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        let errorResponse;
        let statusCode;

        // Handle PrismaClientKnownRequestError
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2002': // Unique constraint failure
              errorResponse = {
                message: 'Unique constraint violation',
                detail: `The ${error.meta?.target} already exists.`,
                code: 'UNIQUE_CONSTRAINT_VIOLATION',
              };
              statusCode = HttpStatus.CONFLICT;
              break;
            case 'P2025': // Record not found
              errorResponse = {
                message: 'Record not found',
                detail: error.meta?.cause || 'The requested record does not exist.',
                code: 'RECORD_NOT_FOUND',
              };
              statusCode = HttpStatus.NOT_FOUND;
              break;
            case 'P2003': // Foreign key constraint failure
              errorResponse = {
                message: 'Foreign key constraint violation',
                detail: `Related ${error.meta?.field_name} does not exist.`,
                code: 'FOREIGN_KEY_VIOLATION',
              };
              statusCode = HttpStatus.BAD_REQUEST;
              break;
            default:
              errorResponse = {
                message: 'Database error',
                detail: error.message,
                code: error.code,
              };
              statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          }

          // Log the detailed database error
          this.logger.error(
            `Database error: ${error.code} ${JSON.stringify(error.meta)}`,
            error.stack,
            'PrismaError',
          );
        } 
        // Handle HttpExceptions
        else if (error instanceof HttpException) {
          statusCode = error.getStatus();
          errorResponse = {
            message: error.message,
            detail: error.getResponse(),
            code: `HTTP_${statusCode}`,
          };

          // Log the HTTP exception
          this.logger.warn(`HTTP Exception: ${statusCode} - ${JSON.stringify(error.getResponse())}`, 'HttpException');
        } 
        // Handle GraphQL errors
        else if (error instanceof GraphQLError) {
          errorResponse = {
            message: error.message,
            detail: error.extensions,
            code: error.extensions?.code || 'GRAPHQL_ERROR',
          };
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

          // Log the GraphQL error
          this.logger.error(
            `GraphQL error: ${error.message} ${JSON.stringify(error.extensions)}`,
            error.stack,
            'GraphQLError',
          );
        } 
        // Handle other errors
        else {
          errorResponse = {
            message: 'Internal server error',
            detail: error.message || 'An unexpected error occurred',
            code: 'INTERNAL_SERVER_ERROR',
          };
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

          // Log the unexpected error
          this.logger.error(
            `Unexpected error: ${error.message || 'Unknown error'}`,
            error.stack,
            'UnexpectedError',
          );
        }

        // Create a GraphQL formatted error for Apollo Server
        const graphqlFormattedError = new GraphQLError(
          errorResponse.message,
          {
            extensions: {
              code: errorResponse.code,
              detail: errorResponse.detail,
              status: statusCode,
            },
          },
        );

        return throwError(() => graphqlFormattedError);
      }),
    );
  }
}