import { journalPath } from "@/lib/routes";
import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/lib/site";

export function Wordmark() {
  return (
    <Link href={journalPath()} className="flex items-center gap-3">
      <Image
        src={ASSETS.emblem}
        alt="Life Sutra Synthesis emblem"
        className="h-14 w-auto shrink-0"
        width={56}
        height={64}
        priority
      />
      <span className="leading-tight">
        <span className="block font-display text-lg tracking-tight text-ink">
          Life Sutra Synthesis
        </span>
        <span className="block text-[0.6rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Journal of Mind, Consciousness Studies &amp; Indian Knowledge Systems
        </span>
      </span>
    </Link>
  );
}
