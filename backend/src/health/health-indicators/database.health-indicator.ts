import { Inject, Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { Knex } from "knex";
import { DATABASE_CONNECTION } from "src/database/providers";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  private readonly key = "db";

  constructor(@Inject(DATABASE_CONNECTION) private readonly knex: Knex) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.knex.raw("SELECT 1");
      return this.getStatus(this.key, true);
    } catch (e) {
      throw new HealthCheckError("Database connection check failed", e);
    }
  }
}
