import type { MetadataRoute } from "next";
import { papers } from "@/data/content";
import { publications } from "@/data/foundation";
import { articlePath, issuePath, journalIssues } from "@/data/journal";
import { actionNav, primaryNav } from "@/data/navigation";
import { FOUNDATION_ROUTES, journalPath } from "@/lib/routes";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths = new Set<string>([
    ...Object.values(FOUNDATION_ROUTES),
    ...publications.map((p) => p.href),
    journalPath(),
    ...primaryNav.map((n) => n.to),
    ...actionNav.map((n) => n.to),
    journalPath("/archive"),
    ...journalIssues.map(issuePath),
    ...papers.map((p) => articlePath(p.id)),
  ]);

  return [...paths].map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" || path === journalPath() ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
