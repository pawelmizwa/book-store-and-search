import { ClsService } from "nestjs-cls";
import { Params } from "nestjs-pino";
import { LogLevel } from "src/config/logger.config";
import { TypedConfigService } from "src/config/typed-config-service";
import { Environment } from "src/enums";

export class Logger {
  private readonly env = this.configService.get("environment");

  constructor(
    private readonly configService: TypedConfigService,
    private readonly cls: ClsService
  ) {}

  configureLogger(): Params {
    const environment = this.configService.get("environment");

    return {
      pinoHttp: {
        autoLogging: true,
        level: this.getLogLevel(),
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        formatters: {
          level: label => ({ level: label }),
          log: object => {
            return {
              ...object,
              environment,
              ...this.getFullInstrumentationContext(),
            };
          },
        },
        base: {
          env: this.env,
        },
        ...(this.env === Environment.LOCAL
          ? {
              transport: {
                target: "pino-pretty",
                options: {
                  singleLine: true,
                },
              },
            }
          : {}),
      },
    };
  }

  private getLogLevel() {
    const level = this.configService.get("logger").level;
    if (level) {
      return level;
    }

    switch (this.env) {
      case Environment.LOCAL:
      case Environment.DEV:
        return LogLevel.DEBUG;
      case Environment.STAGE:
      case Environment.PROD:
        return LogLevel.INFO;
    }
  }

  private getTraceInstrumentationContext() {
    return {
      traceId: this.cls.get<string>("traceId"),
      requestId: this.cls.get<string>("requestId"),
    };
  }

  private getFullInstrumentationContext() {
    return {
      b3: this.getTraceInstrumentationContext(),
    };
  }
}
