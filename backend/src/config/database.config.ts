import { z } from "zod";

export const databaseConfigSchema = z.object({
  url: z.string(),
  poolSize: z.number(),
});

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

export function readDatabaseConfig() {
  return databaseConfigSchema.parse({
    url: process.env.DATABASE_URL,
    poolSize: Number(process.env.DATABASE_POOL_SIZE ?? 10),
  });
}
