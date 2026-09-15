import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lint via `npm run lint`; Windows CRLF + prettier otherwise fail CI builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
