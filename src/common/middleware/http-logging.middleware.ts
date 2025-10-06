import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    // Log del request entrante
    this.logger.log(`📥 ${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Capturar cuando la respuesta termina
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('Content-Length');
      const responseTime = Date.now() - startTime;

      // Elegir emoji basado en status code
      let emoji = '✅';
      if (statusCode >= 400 && statusCode < 500) {
        emoji = '⚠️';
      } else if (statusCode >= 500) {
        emoji = '❌';
      }

      this.logger.log(
        `📤 ${emoji} ${method} ${originalUrl} ${statusCode} ${contentLength || 0}b - ${responseTime}ms`,
      );
    });

    next();
  }
}
