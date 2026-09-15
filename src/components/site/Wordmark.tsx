import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/lib/site";

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        src={ASSETS.emblem}
        alt="Life Sutra emblem"
        className="h-11 w-auto shrink-0"
        width={44}
        height={50}
        priority
      />
      <span className="leading-tight">
        <span className="block font-display text-lg tracking-tight text-ink">Life Sutra</span>
        <span className="block text-[0.6rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Journal of Mind, Consciousness Studies &amp; Indian Knowledge Systems
        </span>
      </span>
    </Link>
  );
}
