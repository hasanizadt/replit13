
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import { join } from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(private configService: ConfigService) {
    const logDir = join(process.cwd(), 'logs');

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, context }) => {
        return `[${timestamp}] ${level} [${context || 'Application'}]: ${message}`;
      })
    );

    const fileFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    );

    const consoleTransport = new winston.transports.Console({
      format: consoleFormat
    });

    const fileTransport = new DailyRotateFile({
      dirname: logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      format: fileFormat
    });

    const errorFileTransport = new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'error',
      format: fileFormat
    });

    this.logger = winston.createLogger({
      level: this.configService.get('app.logging.level', 'info'),
      transports: [consoleTransport, fileTransport, errorFileTransport]
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context: context || this.context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }
}
