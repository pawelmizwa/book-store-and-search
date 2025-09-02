import { Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { FastifyReply } from "fastify";
import { ZodError } from "zod";

export type ExceptionResponseBody = {
  message: string;
  errors?: {
    message: string;
    path: string;
  }[];
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const statusCode = this.getStatusCode(exception);
    const responseBody = this.getResponseBody(exception);
    response.status(statusCode).send(responseBody);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof ZodError) {
      return HttpStatus.BAD_REQUEST;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
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
        errors: exception.errors.map(error => ({
          message: error.message,
          path: error.path.join("."),
        })),
      };
    }

    return {
      message: "Internal server error",
    };
  }
}
