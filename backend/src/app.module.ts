import { Module } from "@nestjs/common";
import { TypedConfigModule } from "src/config/typed-config-module";
import { DatabaseModule } from "src/database/database-module";
import { LoggerModule } from "src/logger/logger-module";
import { ClsConfigModule } from "src/config/cls-module";
import { BookModule } from "src/modules/book/book.module";
import { HealthModule } from "src/health/health.module";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";

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
export class AppModule {}
