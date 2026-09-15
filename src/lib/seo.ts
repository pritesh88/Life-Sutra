import type { Metadata } from "next";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

type PageMetaInput = {
  /** Short title segment; layout template appends "— Life Sutra". */
  title: string;
  description: string;
  /** Absolute path, e.g. "/research". Use "/" for home. */
  path?: string;
  /** Bypass the root title template (home page). */
  absoluteTitle?: string;
  ogTitle?: string;
};

export function pageMeta({
  title,
  description,
  path = "/",
  absoluteTitle,
  ogTitle,
}: PageMetaInput): Metadata {
  const url = new URL(path, getSiteUrl()).toString();
  const resolvedOgTitle = ogTitle ?? absoluteTitle ?? `${title} — ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: resolvedOgTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedOgTitle,
      description,
    },
  };
}
