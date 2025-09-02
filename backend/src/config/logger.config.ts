import { z } from "zod";

export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

export const loggerConfigSchema = z.object({
  level: z.nativeEnum(LogLevel),
});

export type LoggerConfig = z.infer<typeof loggerConfigSchema>;

export function readLoggerConfig() {
  return loggerConfigSchema.parse({
    level: (process.env.LOG_LEVEL ?? LogLevel.INFO) as LogLevel,
  });
}
