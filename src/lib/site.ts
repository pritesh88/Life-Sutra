export const SITE_NAME = "Life Sutra";
export const SITE_TAGLINE = "Research Platform for Indian Knowledge Systems";
export const SITE_DESCRIPTION =
  "Life Sutra is a peer-reviewed e-journal and research platform for Indian Knowledge Systems.";
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
