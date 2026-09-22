export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Query-string values are hints for initial filters only; the API validates them again. */
export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
