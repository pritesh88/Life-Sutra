export const SITE_NAME = "Life Sutra Synthesis";
export const SITE_TAGLINE = "Scholarly Research Publication for Indian Knowledge Systems";
export const SITE_DESCRIPTION =
  "Life Sutra Synthesis is a peer-reviewed scholarly research publication for Indian Knowledge Systems.";
export const SITE_EMAIL = "editorial@lifesutra.org";

/** Canonical origin used for metadata, sitemap, and robots. */
export function getSiteUrl() {
  return process.env["NEXT_PUBLIC_SITE_URL"]?.replace(/\/$/, "") ?? "https://lifesutra.org";
}

export const ASSETS = {
  emblem: "/assets/life-sutra-emblem.png",
  logo: "/assets/life-sutra-logo.png",
  hero: "/assets/hero-reading-room.jpg",
  favicon: "/favicon.png",
} as const;
