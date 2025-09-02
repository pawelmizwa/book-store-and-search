import { InvalidResponseError } from "src/errors/invalid-response-error";
import { z } from "zod";

/**
 *  This is very minimal implementation that only handles GET requests.
 *  You should extend it with your growing needs.
 */
export async function apiClient({
  url,
  zodSchema,
}: {
  url: string;
  zodSchema: z.ZodSchema;
}) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new InvalidResponseError();
  }

  const data = await response.json();

  return zodSchema.parse(data);
}
