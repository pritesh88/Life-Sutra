/** Thrown by handlers/services to produce a specific, safe HTTP response. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly options: {
      fields?: Record<string, string[] | undefined>;
      retryAfterSeconds?: number;
    } = {},
  ) {
    super(message);
  }
}

export const notFound = () => new HttpError(404, "Not found.");
export const forbidden = () =>
  new HttpError(403, "You do not have permission to perform this action.");
export const unauthenticated = () => new HttpError(401, "Authentication is required.");
export const tooManyRequests = (retryAfterSeconds: number) =>
  new HttpError(429, "Too many attempts. Please try again later.", { retryAfterSeconds });
