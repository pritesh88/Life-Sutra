import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/** Life Sutra Synthesis — the journal keeps its own header, footer and theme. */
export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME },
};

export default function JournalLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
