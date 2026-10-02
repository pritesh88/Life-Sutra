export const SITE_NAME = "Life Sutra Synthesis";
export const SITE_TAGLINE = "Scholarly Research Publication for Indian Knowledge Systems";
export const SITE_DESCRIPTION =
  "Life Sutra Synthesis is a peer-reviewed scholarly research publication for Indian Knowledge Systems.";
export const SITE_EMAIL = "editorial@lifesutra.co.in";

/** Canonical origin used for metadata, sitemap, and robots. */
export function getSiteUrl() {
  return process.env["NEXT_PUBLIC_SITE_URL"]?.replace(/\/$/, "") ?? "https://www.lifesutra.co.in";
}

export const ASSETS = {
  emblem: "/assets/life-sutra-emblem.png",
  logo: "/assets/life-sutra-logo.png",
  hero: "/assets/hero-reading-room.jpg",
  favicon: "/favicon.png",
  ismartlifelogo: "/assets/ismartlifelogo.jpeg",
} as const;

/** Life Sutra Synthesis's own browser-tab icon (the foundation uses /islf/). */
export const JOURNAL_ICONS = {
  icon: [
    { url: "/favicon.svg", type: "image/svg+xml" },
    { url: "/favicon.png", type: "image/png", sizes: "64x64" },
    { url: "/favicon.ico", sizes: "any" },
  ],
  apple: "/apple-touch-icon.png",
};
