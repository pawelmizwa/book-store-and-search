import { TypedConfigService } from "src/config/typed-config-service";
import { Logger } from "@nestjs/common";
import knex from "knex";

export class PgConnector {
  private readonly logger = new Logger(PgConnector.name);

  constructor(private readonly config: TypedConfigService) {}

  connect() {
    try {
      const dbConfig = this.config.get("database");
      this.logger.log(`Connecting to database`, {
        poolSize: dbConfig.poolSize,
        url: dbConfig.url.replace(/:[^:@]*@/, ':****@') // Hide password in logs
      });

      const connection = knex({
        client: "pg",
        connection: dbConfig.url,
        pool: { min: 0, max: dbConfig.poolSize },
      });

      this.logger.log(`Database connection established successfully`);
      return connection;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to database: ${errorMessage}`, {
        error: error instanceof Error ? error.stack : String(error)
      });
      throw error;
    }
  }
}
