import { Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { DomainError } from "src/core/errors/domain-error";
import { BookErrorCodes } from "src/modules/book/domain/errors/book.error-codes";

export type ExceptionResponseBody = {
  message: string;
  errors?: {
    message: string;
    path: string;
  }[];
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();
    const statusCode = this.getStatusCode(exception);
    const responseBody = this.getResponseBody(exception);

    // Log all exceptions with detailed information
    this.logException(exception, request, statusCode);

    // Use NestJS BaseExceptionFilter to handle the response properly
    const httpException = new HttpException(responseBody, statusCode);
    super.catch(httpException, host);
  }

  private logException(exception: unknown, request: FastifyRequest, statusCode: number): void {
    const errorDetails = {
      method: request.method,
      url: request.url,
      query: request.query,
      headers: request.headers,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      statusCode,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof Error) {
      this.logger.error(`Exception occurred: ${exception.message}`, {
        ...errorDetails,
        name: exception.name,
        stack: exception.stack,
      });
    } else if (exception instanceof HttpException) {
      this.logger.warn(`HTTP Exception: ${exception.message}`, {
        ...errorDetails,
        status: exception.getStatus(),
        response: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      this.logger.warn(`Validation Error`, {
        ...errorDetails,
        errors: exception.issues,
      });
    } else {
      this.logger.error(`Unknown exception type`, {
        ...errorDetails,
        exception: String(exception),
        type: typeof exception,
      });
    }
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof ZodError) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof DomainError) {
      return this.mapDomainErrorToHttpStatus(exception);
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private mapDomainErrorToHttpStatus(error: DomainError): number {
    switch (error.errorCode) {
      case BookErrorCodes.BOOK_NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case BookErrorCodes.BOOK_ALREADY_EXISTS:
      case BookErrorCodes.DUPLICATE_ISBN:
        return HttpStatus.CONFLICT;
      case BookErrorCodes.INVALID_BOOK_DATA:
      case BookErrorCodes.INVALID_CURSOR:
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getResponseBody(exception: unknown): ExceptionResponseBody {
    if (exception instanceof HttpException) {
      return {
        message: exception.message,
      };
    }

    if (exception instanceof ZodError) {
      return {
        message: "Validation failed",
        errors: exception.issues.map((error) => ({
          message: error.message,
          path: error.path.join("."),
        })),
      };
    }

    if (exception instanceof DomainError) {
      return {
        message: this.getDomainErrorMessage(exception),
      };
    }

    return {
      message: "Internal server error",
    };
  }

  private getDomainErrorMessage(error: DomainError): string {
    // Provide user-friendly error messages for common domain errors
    switch (error.errorCode) {
      case BookErrorCodes.INVALID_CURSOR:
        return "Invalid or expired pagination cursor. Please restart pagination from the beginning.";
      case BookErrorCodes.BOOK_NOT_FOUND:
        return error.message;
      case BookErrorCodes.BOOK_ALREADY_EXISTS:
      case BookErrorCodes.DUPLICATE_ISBN:
        return error.message;
      case BookErrorCodes.INVALID_BOOK_DATA:
        return error.message;
      default:
        return error.message || "An error occurred";
    }
  }
}
