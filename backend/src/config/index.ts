import { Environment } from "src/enums";
import { z } from "zod";
import { loggerConfigSchema, readLoggerConfig } from "src/config/logger.config";
import { authConfigSchema, readAuthConfig } from "src/config/auth.config";
import { databaseConfigSchema, readDatabaseConfig } from "src/config/database.config";

const configSchema = z.object({
  environment: z.nativeEnum(Environment),
  port: z.number(),
  logger: loggerConfigSchema,
  database: databaseConfigSchema,
  auth: authConfigSchema,
});

export type Config = z.infer<typeof configSchema>;

export default (): Config =>
  configSchema.parse({
    environment: process.env.ENVIRONMENT ?? Environment.LOCAL,
    port: Number(process.env.PORT ?? 8080),
    logger: readLoggerConfig(),
    database: readDatabaseConfig(),
    auth: readAuthConfig(),
  });
