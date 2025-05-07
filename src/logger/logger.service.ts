import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  constructor(private readonly configService: ConfigService) {}

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: any, context?: string) {
    console.log(`[LOG] ${context || this.context} - ${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    console.error(`[ERROR] ${context || this.context} - ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    console.warn(`[WARN] ${context || this.context} - ${message}`);
  }

  debug(message: any, context?: string) {
    console.debug(`[DEBUG] ${context || this.context} - ${message}`);
  }

  verbose(message: any, context?: string) {
    console.log(`[VERBOSE] ${context || this.context} - ${message}`);
  }
}