import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { DatabaseModule } from "src/database/database-module";
import { HealthController } from "src/health/health.controller";
import { DatabaseHealthIndicator } from "src/health/health-indicators/database.health-indicator";

@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator],
})
export class HealthModule {}
