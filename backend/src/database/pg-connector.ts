import { TypedConfigService } from "src/config/typed-config-service";
import knex from "knex";

export class PgConnector {
  constructor(private readonly config: TypedConfigService) {}

  connect() {
    return knex({
      client: "pg",
      connection: this.config.get("database").url,
      pool: { min: 0, max: this.config.get("database").poolSize },
    });
  }
}
