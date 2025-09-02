import { ClsModule } from "nestjs-cls";
import { ClsPluginTransactional } from "@nestjs-cls/transactional";
import { DatabaseModule } from "src/database/database-module";
import { TransactionalAdapterKnex } from "@nestjs-cls/transactional-adapter-knex";
import { DATABASE_CONNECTION } from "src/database/providers";
import { randomUUID } from "crypto";
import { Logger } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";

const TRACE_ID_HEADER_KEY = "x-b3-traceid";

export const ClsConfigModule = ClsModule.forRootAsync({
  global: true,
  useFactory: () => {
    const logger = new Logger("CLS");

    return {
      middleware: {
        mount: true,
        setup(cls, req: FastifyRequest) {
          const traceId = req.headers[TRACE_ID_HEADER_KEY] || createTraceId();

          cls.set("path", req.url);
          cls.set("method", req.method);
          cls.set("requestId", req.id);
          cls.set("traceId", traceId);

          logger.log(
            "Request received",
            getRequestMetadata({
              traceId: Array.isArray(traceId) ? traceId.join() : traceId,
              req,
            })
          );
        },
      },
      guard: {
        mount: true,
        setup(cls, ctx) {
          const req = ctx.switchToHttp().getRequest();
          const traceId = cls.get("traceId");

          logger.log(
            "Request guard",
            getRequestMetadata({
              traceId,
              req,
            })
          );
        },
      },
      interceptor: {
        mount: true,
        setup(cls, ctx) {
          const req = ctx.switchToHttp().getRequest();
          const res = ctx.switchToHttp().getResponse() as FastifyReply;
          const traceId = cls.get("traceId");

          // add trace id to the response
          res.header(TRACE_ID_HEADER_KEY, traceId);

          logger.log("Response sent", getRequestMetadata({ traceId, req, res }));
        },
      },
    };
  },
  plugins: [
    new ClsPluginTransactional({
      imports: [DatabaseModule],
      adapter: new TransactionalAdapterKnex({
        knexInstanceToken: DATABASE_CONNECTION,
      }),
      enableTransactionProxy: true,
    }),
  ],
});

function createTraceId() {
  return randomUUID().replace(/-/g, "");
}

function getRequestMetadata({
  traceId,
  req,
  res,
}: {
  traceId: string;
  req: FastifyRequest;
  res?: FastifyReply;
}) {
  return {
    request: {
      traceId,
      requestId: req.id,
      method: req.method,
      path: req.url,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    },
    response: res && {
      statusCode: res.statusCode,
      responseTime: res.elapsedTime,
    },
  };
}
