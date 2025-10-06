import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    // Log de entrada con detalles
    this.logger.debug(
      `🎯 ${className}.${handlerName}() - ${method} ${url}
      📋 Query: ${JSON.stringify(query)}
      📋 Params: ${JSON.stringify(params)}
      📋 Body: ${JSON.stringify(body, null, 2)}`,
    );

    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime;
        this.logger.debug(
          `✅ ${className}.${handlerName}() completed in ${responseTime}ms
          📤 Response: ${JSON.stringify(data, null, 2)}`,
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        this.logger.error(
          `❌ ${className}.${handlerName}() failed in ${responseTime}ms
          🚫 Error: ${error.message}
          📍 Stack: ${error.stack}`,
        );
        return throwError(() => error);
      }),
    );
  }
}
