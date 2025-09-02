import { z } from "zod";

export const authConfigSchema = z.object({
  jwksCertificateURI: z.string(),
});

export type AuthConfig = z.infer<typeof authConfigSchema>;

export function readAuthConfig() {
  return authConfigSchema.parse({
    jwksCertificateURI: process.env.IAM_JWKS_URI || "",
  });
}
