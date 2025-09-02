import { Controller, Get, Logger } from "@nestjs/common";
import { HealthCheckService, HealthCheck } from "@nestjs/terminus";
import { DatabaseHealthIndicator } from "src/health/health-indicators/database.health-indicator";

@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private db: DatabaseHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    this.logger.log("Health check initiated");
    return this.health.check([() => this.db.isHealthy()]);
  }
}
