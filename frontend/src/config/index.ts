import { z } from "zod";

export enum Environment {
  local = "local",
  dev = "dev",
  prod = "prod",
}

export function getConfig() {
  const environment =
    getEnvVariable("NEXT_PUBLIC_ENVIRONMENT") ?? Environment.local;

  return configSchema.parse({
    environment,
  });
}

const configSchema = z.object({
  environment: z.nativeEnum(Environment),
});

function getEnvVariable(name: string) {
  if (typeof window !== "undefined" && window.__ENV) {
    return window.__ENV[name];
  }
  return process.env[name];
}
