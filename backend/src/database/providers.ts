import { TypedConfigService } from "src/config/typed-config-service";
import { PgConnector } from "src/database/pg-connector";

export const DATABASE_CONNECTION = "DATABASE_CONNECTION";

export const connectionProvider = {
  provide: DATABASE_CONNECTION,
  useFactory: (config: TypedConfigService) => new PgConnector(config).connect(),
  inject: [TypedConfigService],
};
