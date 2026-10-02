import type { Metadata } from "next";
import { FOUNDATION } from "@/data/foundation";
import { pageMeta } from "@/lib/seo";

/** pageMeta for foundation pages: titles end in "— I Smart Life Foundation". */
export function foundationMeta(input: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: string;
}): Metadata {
  return pageMeta({ ...input, siteName: FOUNDATION.name });
}
