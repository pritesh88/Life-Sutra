import type { MetadataRoute } from "next";
import { actionNav, primaryNav } from "@/data/navigation";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths = new Set<string>([
    "/",
    ...primaryNav.map((n) => n.to),
    ...actionNav.map((n) => n.to),
  ]);

  return [...paths].map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
