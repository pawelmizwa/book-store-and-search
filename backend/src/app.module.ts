import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { TypedConfigModule } from "src/config/typed-config-module";
import { DatabaseModule } from "src/database/database-module";
import { LoggerModule } from "src/logger/logger-module";
import { ClsConfigModule } from "src/config/cls-module";
import { BookModule } from "src/modules/book/book.module";
import { HealthModule } from "src/health/health.module";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { InputSanitizationMiddleware } from "src/middleware/input-sanitization.middleware";
import { RateLimitingMiddleware } from "src/middleware/rate-limiting.middleware";

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
    consumer
      .apply(InputSanitizationMiddleware)
      .forRoutes('*'); // Apply to all routes
    
    consumer
      .apply(RateLimitingMiddleware)
      .forRoutes('books'); // Apply rate limiting to book routes
  }
}
