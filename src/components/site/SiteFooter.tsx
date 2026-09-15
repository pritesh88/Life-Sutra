import Image from "next/image";
import Link from "next/link";
import { footerGroups } from "@/data/navigation";
import { ASSETS, SITE_EMAIL } from "@/lib/site";
import { Container, Eyebrow, Ornament } from "./primitives";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-earth text-earth-foreground">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Image
              src={ASSETS.logo}
              alt="Life Sutra — Journal of Mind, Consciousness Studies, and Synthesis of Indian Knowledge Systems"
              className="h-28 w-auto rounded-md bg-white/95 p-2"
              width={280}
              height={280}
            />
            <p className="mt-3 text-sm leading-relaxed text-earth-foreground/75">
              A global research and knowledge platform for Indian Knowledge Systems — publishing
              peer-reviewed scholarship and building the infrastructure that connects it.
            </p>
            <p className="mt-5 text-xs tracking-wide text-earth-foreground/60">{SITE_EMAIL}</p>
          </div>
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <Eyebrow className="text-earth-foreground/60">{group.title}</Eyebrow>
              <ul className="mt-4 grid gap-2.5 text-sm">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      href={item.to}
                      className="link-underline text-earth-foreground/85 hover:text-earth-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <Ornament className="my-10 opacity-60" />
        <div className="flex flex-col gap-3 text-xs text-earth-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Life Sutra. Published quarterly. ISSN 2947-4412.</p>
          <p>Open abstracts · Double-anonymous peer review · Content licensed CC BY-NC 4.0</p>
        </div>
      </Container>
    </footer>
  );
}
