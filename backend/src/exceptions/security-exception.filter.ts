import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Catch()
export class SecurityExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SecurityExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    let status = 500;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || message;
        errorCode = (errorResponse as any).error || errorCode;
      }
    }

    // Log security-related errors with more detail
    const isSecurityRelated = this.isSecurityRelatedError(status, message);
    if (isSecurityRelated) {
      this.logger.warn(`Security incident detected`, {
        status,
        message,
        method: request.method,
        url: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        timestamp: new Date().toISOString(),
      });
    }

    // Sanitize error messages in production to prevent information leakage
    const sanitizedMessage = process.env.NODE_ENV === 'production' 
      ? this.sanitizeErrorMessage(status, message)
      : message;

    const errorResponse = {
      statusCode: status,
      message: sanitizedMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV !== 'production' && { details: errorCode })
    };

    response.status(status).send(errorResponse);
  }

  private isSecurityRelatedError(status: number, message: string): boolean {
    const securityStatuses = [400, 401, 403, 429]; // Bad Request, Unauthorized, Forbidden, Too Many Requests
    const securityPatterns = [
      /validation/i,
      /invalid.*format/i,
      /uuid/i,
      /cursor/i,
      /rate.*limit/i,
      /too.*many.*requests/i
    ];

    return securityStatuses.includes(status) || 
           securityPatterns.some(pattern => pattern.test(message));
  }

  private sanitizeErrorMessage(status: number, message: string): string {
    const sanitizedMessages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
    };

    return sanitizedMessages[status] || 'Request failed';
  }
}
