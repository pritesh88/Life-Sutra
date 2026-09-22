import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import { AuditEvent, audit } from "@/lib/auth/audit";
import { csrfValid, isMutation, originAllowed } from "@/lib/auth/csrf";
import { canAny } from "@/lib/auth/rbac/authorize";
import { getRequestSession } from "@/lib/auth/session";
import type { ResolvedSession } from "@/lib/auth/session-store";
import type { AuthUser, Permission } from "@/lib/auth/types";
import { HttpError } from "@/lib/api/errors";
import { splitPermission } from "@/lib/auth/rbac/catalog";

/**
 * One guard for every API route, so no handler can forget a check:
 *
 *   1. Origin / Fetch-Metadata     (cross-site mutation → 403)
 *   2. Content-Type is JSON        (mutations; blocks form-encoded CSRF → 415)
 *   3. Session                     (none → 401)
 *   4. CSRF token                  (mutations; bad → 403)
 *   5. Permission (any-of)         (missing → 403, audited)
 *
 * Handlers receive a `user` the server computed — never client-provided.
 * Responses are `no-store`; unexpected errors become a generic 500.
 */

const MAX_BODY_BYTES = 64 * 1024;

type Params = Record<string, string>;
type Handler<Ctx> = (ctx: Ctx) => Promise<Response> | Response;

export type PublicContext<P extends Params> = {
  request: NextRequest;
  params: P;
  session: ResolvedSession | null;
};

export type ProtectedContext<P extends Params> = {
  request: NextRequest;
  params: P;
  session: ResolvedSession;
  user: AuthUser;
};

type RouteContext<P> = { params: Promise<P> };

function fail(error: HttpError) {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (error.options.retryAfterSeconds)
    headers["Retry-After"] = String(error.options.retryAfterSeconds);
  const body: { error: string; fields?: Record<string, string[] | undefined> } = {
    error: error.message,
  };
  if (error.options.fields) body.fields = error.options.fields;
  return NextResponse.json(body, { status: error.status, headers });
}

function noStore(response: Response) {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function wrap(run: () => Promise<Response> | Response) {
  try {
    return noStore(await run());
  } catch (error) {
    if (error instanceof HttpError) return fail(error);
    console.error("[api] unhandled error", error);
    return fail(new HttpError(500, "Something went wrong. Please try again."));
  }
}

function mutationPreflight(request: NextRequest) {
  if (!isMutation(request.method)) return;
  if (!originAllowed(request)) throw new HttpError(403, "Cross-site request blocked.");
  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.toLowerCase().startsWith("application/json"))
    throw new HttpError(415, "Content-Type must be application/json.");
}

async function rejectCsrf(request: NextRequest, session: ResolvedSession | null): Promise<never> {
  await audit(request, AuditEvent.CsrfRejected, {
    actorId: session?.user.id ?? null,
    outcome: "DENIED",
    metadata: { path: new URL(request.url).pathname, method: request.method },
  });
  throw new HttpError(403, "Invalid CSRF token.");
}

/** Route that works signed-out or signed-in (login, register, logout, session probe…). */
export function publicRoute<P extends Params = Params>(
  options: { csrf?: boolean },
  handler: Handler<PublicContext<P>>,
) {
  return (request: NextRequest, context: RouteContext<P>) =>
    wrap(async () => {
      mutationPreflight(request);
      const session = await getRequestSession(request);
      if (isMutation(request.method) && options.csrf !== false && !csrfValid(request, session))
        await rejectCsrf(request, session);
      return handler({ request, params: await context.params, session });
    });
}

/** Route that requires a signed-in caller and (optionally) any one of `permission`. */
export function protectedRoute<P extends Params = Params>(
  options: { permission?: Permission | readonly Permission[] },
  handler: Handler<ProtectedContext<P>>,
) {
  const required: readonly Permission[] = options.permission
    ? Array.isArray(options.permission)
      ? options.permission
      : [options.permission as Permission]
    : [];
  return (request: NextRequest, context: RouteContext<P>) =>
    wrap(async () => {
      mutationPreflight(request);
      const session = await getRequestSession(request);
      if (!session) throw new HttpError(401, "Authentication is required.");
      if (isMutation(request.method) && !csrfValid(request, session))
        await rejectCsrf(request, session);
      if (required.length > 0 && !canAny(session.user, required)) {
        const { resource, action } = splitPermission(required[0]!);
        await audit(request, AuditEvent.AuthorizationDenied, {
          actorId: session.user.id,
          resource,
          action,
          outcome: "DENIED",
          metadata: { path: new URL(request.url).pathname, method: request.method },
        });
        throw new HttpError(403, "You do not have permission to perform this action.");
      }
      return handler({ request, params: await context.params, session, user: session.user });
    });
}

/** Parses and validates a JSON body. Unknown keys are stripped by the schema. */
export async function readJson<S extends z.ZodTypeAny>(
  request: NextRequest,
  schema: S,
): Promise<z.infer<S>> {
  // Reject an honestly-declared oversized body before buffering any of it.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) throw new HttpError(413, "Request body is too large.");
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, "Request body is too large.");
  let raw: unknown;
  try {
    raw = text ? JSON.parse(text) : undefined;
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new HttpError(422, "Please correct the highlighted fields.", {
      fields: parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>,
    });
  }
  return parsed.data;
}

export function json(body: unknown, init?: number | ResponseInit) {
  return NextResponse.json(body, typeof init === "number" ? { status: init } : init);
}
