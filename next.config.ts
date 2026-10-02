import type { NextConfig } from "next";

const production = process.env.NODE_ENV === "production";

// Conservative headers that cannot break the existing UI. A full script-src CSP
// needs per-request nonces and is a separate piece of work.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  ...(production
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

// Life Sutra Synthesis moved from the site root to /publications/life-sutra-synthesis
// when I Smart Life Foundation became the root site. Keep every old URL working.
// Mirrors JOURNAL_BASE in src/lib/routes.ts.
const JOURNAL_BASE = "/publications/life-sutra-synthesis";
const LEGACY_JOURNAL_SECTIONS = [
  "research",
  "archive",
  "research-abstracts",
  "conferences",
  "iks-dialogue",
  "white-papers",
  "research-opportunities",
  "methodology",
  "institutions",
  "research-impact",
  "researchers",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The integration tests build into their own directory so they never clobber `next dev`.
  distDir: process.env["NEXT_DIST_DIR"] ?? ".next",
  // Lint via `npm run lint`; Windows CRLF + prettier otherwise fail CI builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // The libSQL (Turso) driver loads native binaries at runtime; webpack must not bundle it.
  serverExternalPackages: ["@prisma/adapter-libsql", "@libsql/client", "libsql"],
  async redirects() {
    return [
      ...LEGACY_JOURNAL_SECTIONS.flatMap((section) => [
        { source: `/${section}`, destination: `${JOURNAL_BASE}/${section}`, permanent: true },
        {
          source: `/${section}/:path*`,
          destination: `${JOURNAL_BASE}/${section}/:path*`,
          permanent: true,
        },
      ]),
      { source: "/articles/:id", destination: `${JOURNAL_BASE}/research/:id`, permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
