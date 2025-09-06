import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { TypedConfigModule } from "src/config/typed-config-module";
import { DatabaseModule } from "src/database/database-module";
import { LoggerModule } from "src/logger/logger-module";
import { ClsConfigModule } from "src/config/cls-module";
import { BookModule } from "src/modules/book/book.module";
import { HealthModule } from "src/health/health.module";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { InputSanitizationMiddleware } from "src/middleware/input-sanitization.middleware";

@Module({
  imports: [
    TypedConfigModule,
    DatabaseModule,
    ClsConfigModule,
    LoggerModule,
    BookModule,
    HealthModule,
    PrometheusModule.register(),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply library-based input sanitization to all routes
    consumer
      .apply(InputSanitizationMiddleware)
      .forRoutes('*');
    
    // Note: Rate limiting is handled by @fastify/rate-limit plugin in main.ts
  }
}
