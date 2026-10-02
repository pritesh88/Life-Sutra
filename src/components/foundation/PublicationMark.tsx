import Image from "next/image";
import type { Publication } from "@/data/foundation";
import { ASSETS } from "@/lib/site";

/**
 * Small identifying mark for each publication, in that publication's own
 * colours — the journal's parchment emblem, Life Sutra's plum cloth and gold.
 */
export function PublicationMark({ slug }: { slug: Publication["slug"] }) {
  if (slug === "life-sutra-synthesis") {
    return (
      <span className="grid size-11 shrink-0 place-items-center border border-[oklch(0.888_0.017_82)] bg-[oklch(0.955_0.019_84)]">
        <Image src={ASSETS.emblem} alt="" width={64} height={64} className="size-8" />
      </span>
    );
  }
  return (
    <span
      className="relative grid size-11 shrink-0 place-items-center"
      style={{ backgroundImage: "linear-gradient(150deg, #6e3270, #4f2259 48%, #321640)" }}
      aria-hidden="true"
    >
      <span className="absolute inset-y-0 left-1.5 w-px bg-[#d9ae62]/80" />
      <span className="bg-gradient-to-b from-[#f6e2ad] via-[#d9ae62] to-[#a87631] bg-clip-text font-imprint-display text-xl leading-none text-transparent italic">
        LS
      </span>
    </span>
  );
}
