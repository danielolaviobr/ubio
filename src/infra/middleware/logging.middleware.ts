import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction) {
    this.logHttpCall(request, response);
    next();
  }

  private logHttpCall(request: Request, response: Response) {
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;
    const traceId = uuid();

    this.logger.log(`[${traceId}] ${method} ${url} ${userAgent} ${ip}`);

    const now = Date.now();

    response.on('close', () => {
      const { statusCode } = response;

      const contentLength = response.get('content-length');
      const duration = Date.now() - now;

      this.logger.log(
        `[${traceId}] ${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip} duration: ${duration}ms`,
      );
    });
  }
}
