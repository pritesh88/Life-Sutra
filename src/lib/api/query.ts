import { z } from "zod";
import { HttpError } from "@/lib/api/errors";

const idSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/);

/** Parses `?limit=&cursor=` style query strings with safe bounds. */
export function readQuery<S extends z.ZodTypeAny>(url: string, schema: S): z.infer<S> {
  const params = Object.fromEntries(new URL(url).searchParams.entries());
  const parsed = schema.safeParse(params);
  if (!parsed.success) throw new HttpError(422, "Invalid query parameters.");
  return parsed.data;
}

export const pageQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: idSchema.optional(),
});

export const routeId = (value: string) => {
  const parsed = idSchema.safeParse(value);
  if (!parsed.success) throw new HttpError(404, "Not found.");
  return parsed.data;
};
