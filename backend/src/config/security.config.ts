import { z } from 'zod';

export const securityConfigSchema = z.object({
  CURSOR_SECRET: z.string().default('change-me-in-production'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_SEARCH_MAX_REQUESTS: z.coerce.number().default(30),
  ENABLE_SECURITY_LOGGING: z.coerce.boolean().default(true),
});

export type SecurityConfig = z.infer<typeof securityConfigSchema>;
