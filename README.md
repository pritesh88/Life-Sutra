# Life Sutra

Open-access research and knowledge platform for Indian Knowledge Systems.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma (accounts, opaque server sessions, RBAC, audit log, peer review)

## Setup

```sh
npm install
npm run db:generate
# Copy .env.example to .env.local and set DATABASE_URL for PostgreSQL.
npm run db:deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:deploy` | Apply checked-in database migrations |
| `npm run db:seed` | Sync roles/permissions/grants from `src/lib/auth/rbac/catalog.ts` (idempotent; run on every deploy) |
| `npm run db:assign-role -- EMAIL ROLE` | Bootstrap an elevated role (e.g. the first `SUPER_ADMIN`) for a registered account |
| `npm run db:cleanup` | Purge dead sessions, spent reset tokens and expired rate-limit rows (run daily) |
| `npm test` | Build, start a production server on an isolated `*_test` database and run all suites |
| `npm run test:unit` | Pure unit tests only (no database or server) |

## Authentication and authorization

```
User → Session → Roles → Permissions → Authorization service → Protected resource → Audit log
```

**After pulling these changes**, apply the migration and re-sync RBAC (the running app needs both):

```sh
npm run db:deploy && npm run db:seed
npm run db:generate          # stop `next dev` first on Windows (it locks the Prisma engine)
npm run db:assign-role -- you@example.com SUPER_ADMIN   # once, to create the first admin
```

### Authentication

- Passwords: argon2id, Unicode-normalised, 12–128 chars with a letter and a digit, plus common-password and contains-your-email checks. Login always spends one argon2 verification, so response time does not reveal whether an account exists; failures share one generic message.
- Sessions are opaque 256-bit tokens; only their SHA-256 is stored (`Session`). The cookie is `HttpOnly`, `Secure` + `__Host-` prefixed in production, `SameSite=Lax`. Nothing auth-related lives in `localStorage`.
- Lifetime: 30-day absolute cap, 7-day idle timeout. The token rotates hourly (the old one survives a 60 s grace window for parallel tabs); login replaces any presented session (anti-fixation); logout, password change/reset, role change and deactivation revoke sessions server-side.
- CSRF: session-bound double-submit token (`X-CSRF-Token`) on every mutation, plus `Origin`/`Sec-Fetch-Site` checks and a JSON-only content-type rule.
- Brute force: PostgreSQL-backed counters (per IP, per IP+account, per account) for login, registration and reset. The client IP is read `TRUSTED_PROXY_COUNT` hops from the right of `X-Forwarded-For`.
- Password change (needs the current password) and reset (single-use, 30-minute, hashed token delivered in a URL *fragment*). Reset mail goes through `src/lib/mail.ts`; no provider is wired in yet (see *Known limitations*).

### Authorization (RBAC)

`src/lib/auth/rbac/catalog.ts` is the single source of truth for the 12 roles, the permissions (`article:create`, `review:assign`, `audit:view`, …) and the role → permission map. `db:seed` mirrors it into `Role` / `Permission` / `RolePermission` and removes anything no longer in the catalog. At request time permissions are read from the database through `User → UserRole → Role → RolePermission → Permission`; a test asserts the two never drift.

Every API route is wrapped by `protectedRoute({ permission })` / `publicRoute()` in `src/lib/api/route.ts`, which enforces origin → session → CSRF → permission (403 + audit) in one place. Pages use `requirePageUser()`; `src/middleware.ts` only redirects cookie-less visitors and is not a security boundary. Never compare role names in application code — ask `can(user, permission)`. Ownership rules (own article, own assignment) are enforced in the service layer and answer **404**, not 403, so ids cannot be probed.

Privilege-escalation rules (`src/lib/admin/users.ts`): no self-service role/status changes; you can only grant/revoke a role whose permissions you hold in full; you cannot act on someone who outranks you; the last active `SUPER_ADMIN` is protected; every change is audited in the same transaction and revokes the target's sessions. Self-registration only ever yields `READER` + `AUTHOR`; there is no HTTP path that creates a `SUPER_ADMIN`.

| Endpoint | Permission |
|---|---|
| `POST /api/auth/{register,login,logout}`, `GET /api/auth/{session,csrf}` | public |
| `POST /api/auth/password/{forgot,reset}` | public |
| `POST /api/auth/password/change`, `POST /api/auth/sessions/revoke-others` | signed in |
| `GET /api/admin/users` · `GET /api/admin/roles` | `user:read` · `role:manage` or `user:read` |
| `PATCH /api/admin/users/:id` (activate / deactivate) | `user:manage` |
| `POST /api/admin/users/:id/roles` · `DELETE …/roles/:role` | `role:manage` |
| `GET /api/admin/audit-logs` | `audit:view` |
| `GET/POST /api/articles`, `GET/PATCH /api/articles/:id`, `POST …/submit` | `article:create` / `edit` / `submit` (own only) |
| `GET /api/editor/articles[/:id]` | `article:review` or `review:assign` |
| `POST /api/editor/articles/:id/{assignments,decision,publish}` | `review:assign` · `article:review` · `article:publish` |
| `GET /api/editor/reviewers` | `review:assign` |
| `GET /api/reviews[/:id]`, `POST /api/reviews/:id` | `review:submit` (own assignments only) |

### Double-anonymous peer review

Identity is protected structurally, in `src/lib/peer-review/`:

- Author queries never `select` reviewer columns; reviewer queries never `select` author columns; responses are built from whitelisted views (no row spreading), so a new column cannot leak by accident.
- Reviewers get an assignment id, an opaque manuscript code and a neutral filename (`manuscript-LS-XXXXXXXX.docx`) — never the article id, the author-chosen filename or any identity. Authors see reviews only after the editor's decision, labelled "Reviewer 1…n", with comments-to-author only.
- Identities are visible only with `review:view-identities` (each editorial view is audited). Editors cannot act on their own submissions; a reviewer cannot be assigned to their own article.
- Text an author types into the title/abstract is not scrubbed; editors must still screen submissions for self-identifying content.

### Admin dashboard (`/admin`)

A server-guarded dashboard on the same authorization system — no second RBAC, no client-side authorization, no mock data. Every panel reads the JSON APIs below; the page shells contain no data.

| Section | Page | Unlocked by | Data |
|---|---|---|---|
| Overview (6 KPIs + queues) | `/admin` | any section permission | `GET /api/admin/dashboard` |
| Submissions | `/admin/submissions` | `article:review` or `review:assign` | `GET /api/admin/submissions` |
| Peer Review | `/admin/reviews` | `article:review` or `review:assign` | `GET /api/admin/reviews` |
| Articles | `/admin/articles` | + `article:publish` | `GET /api/admin/submissions?scope=articles` |
| Users & Researchers | `/admin/users` | `user:read` (manage: `user:manage`, `role:manage`) | `GET /api/admin/users` |
| Roles & Permissions | `/admin/roles` | `role:manage` or `user:read` | `GET /api/admin/roles` |
| Audit Logs | `/admin/audit` | `audit:view` | `GET /api/admin/audit-logs` |

- `src/lib/admin/sections.ts` is the only section → permission map; navigation, page guards and API routes all read it. Each page authorizes its own section (a layout does not re-run on navigation).
- KPIs are computed from the same `where` builders as the lists they link to (`src/lib/admin/dashboard.ts`), so a card and its list cannot disagree. A KPI the caller may not see is omitted, not zeroed. Definitions: *New submissions* = submitted, no reviewer yet; *Under review* = reviewers assigned; *Reviews pending* = assigned reports not yet submitted; *Decisions pending* = under review with every review in; *Published* = published articles; *Active researchers* = active accounts holding Researcher/Author with a session seen in the last 30 days.
- Staff never see drafts or their own manuscripts. Author/reviewer identities appear (and are searchable) only with `review:view-identities`; the audit log redacts reviewer-linking entries and blocks actor-filter probing for auditors without it.
- Actions (assign reviewer, decision, publish, roles, activate/deactivate) reuse the existing endpoints and their rules; the UI only offers what the caller's permissions and the server-computed `access` flags allow, and asks before consequential steps.
- Grants are defined in code and synced by `db:seed`, so the Roles view is read-only.

### Audit log

`AuditLog` is append-only: a database trigger rejects `UPDATE`, `DELETE` and `TRUNCATE` (even for the application's own DB role), and the actor foreign key is `RESTRICT` (deactivate users, never delete them). Recorded: registration, login success/failure/lockout, logout, password change/reset, session revocation, CSRF rejection, authorization denials, role and account changes, RBAC sync, article submission/decision/publication, review assignment/submission and identity views. Metadata keys that look like credentials are redacted. In production, run the app with a database role that does not own `"AuditLog"`, so the trigger cannot be dropped by the application.

### Testing

`npm test` provisions an isolated `<database>_test` (it refuses any name not ending in `_test`), applies the migrations, builds into `.next-test`, starts `next start` in production mode and runs `node:test` suites against the real HTTP surface. Set `TEST_DATABASE_URL` to override the target. Add `-- --no-build` to reuse the previous build.

### Known limitations

- No email provider is configured: password-reset links are only delivered with `MAIL_TRANSPORT=console` (development). Add a provider in `src/lib/mail.ts` before relying on reset in production.
- Registration reveals whether an email is already registered (409). Removing that requires an email-verification flow.
- No email verification, MFA or CAPTCHA. The per-account login cap can lock a specific account out of password login for the rest of a 15-minute window (the owner can still use password reset).
- The catalog defines `institution:manage`, `opportunity:manage`, `methodology:manage` and `dialogue:moderate`, but those areas are still static content, so no endpoint enforces them yet.
- There is no manuscript file upload yet; when added, store originals under random keys and always show reviewers `anonymizedFileName()`. Revision rounds are not implemented (`REVISION_REQUESTED` is a terminal decision state).
- Because the root `loading.tsx` streams a shell first, a server-component guard's redirect / not-found reaches the browser as a meta-refresh / not-found fallback with HTTP 200 (not a bare 307/404). Nothing sensitive is rendered and every data API returns real 401/403; giving pages true statuses needs a session check in middleware or route groups without the root loading boundary.
- The CSP is a safe subset (frame-ancestors, base-uri, form-action, object-src); a nonce-based `script-src` is future work.

## Structure

```
src/
  app/                 # App Router pages, layout, sitemap, robots
  app/api/             # Route handlers (auth, admin, articles, editor, reviews)
  components/site/     # Site shell, nav, catalog cards, primitives
  components/auth/     # Login/register/password forms, AuthProvider (UX only)
  components/ui/       # Optional shadcn primitives (not used by marketing pages yet)
  data/                # Static content + page metadata
  lib/auth/            # Sessions, CSRF, rate limiting, audit, RBAC catalog + authorization
  lib/admin/           # User / role administration (escalation rules)
  lib/peer-review/     # Double-anonymous review service, views, anonymity helpers
  lib/api/             # Shared route guard (origin → session → CSRF → permission)
  lib/                 # SEO helpers, site config, utils
  middleware.ts        # Edge redirect for signed-in-only pages (not a security boundary)
prisma/                # Schema, migrations, seed (RBAC sync), bootstrap + cleanup scripts
tests/                 # unit/ + integration/ (node:test) and the orchestrator (run.ts)
public/                # Static assets and research paper downloads
```

Set `NEXT_PUBLIC_SITE_URL` in production so canonical URLs, the sitemap and the CSRF origin check resolve correctly.
