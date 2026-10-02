import Image from "next/image";
import Link from "next/link";
import { FOUNDATION, foundationAddress } from "@/data/foundation";
import { JOURNAL } from "@/data/journal";
import { IMPRINT_BASE } from "@/lib/routes";
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
              alt="Life Sutra Synthesis — Journal of Mind, Consciousness Studies, and Synthesis of Indian Knowledge Systems"
              className="h-28 w-auto rounded-md bg-white/95 p-2"
              width={280}
              height={280}
            />
            <p className="mt-3 text-md">{JOURNAL.title}</p>
            <p className="mt-3 text-sm leading-relaxed text-earth-foreground/75">
              A scholarly research publication for Indian Knowledge Systems — publishing
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
          <div className="flex flex-col gap-5 rounded-md border border-earth-foreground/15 bg-earth-foreground/[0.04] p-6 sm:flex-row sm:items-center md:col-span-4">
            <Link href="/" className="shrink-0" aria-label={`${FOUNDATION.name} — publisher home`}>
              <Image
                src={ASSETS.ismartlifelogo}
                alt={`${FOUNDATION.name} logo`}
                className="h-20 w-auto rounded-md bg-white/95 p-2"
                width={280}
                height={280}
              />
            </Link>
            <div className="flex-1">
              <Eyebrow className="text-earth-foreground/60">Publisher</Eyebrow>
              <p className="mt-2 text-md">{FOUNDATION.publishingBody}</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-earth-foreground/75">
                {FOUNDATION.name}, a {FOUNDATION.legalForm}, is founded on the guiding Mahavakya
                from the Upanishads, {FOUNDATION.mahavakya.transliteration} — &ldquo;
                {FOUNDATION.mahavakya.translation}&rdquo; It also publishes{" "}
                <Link href={IMPRINT_BASE} className="link-underline text-earth-foreground">
                  Life Sutra
                </Link>
                , its second journal.
              </p>
              <p className="mt-3 text-xs tracking-wide text-earth-foreground/60">
                {FOUNDATION.contact.email} · {FOUNDATION.contact.phone} · {foundationAddress()}
              </p>
            </div>
            <Link
              href="/"
              className="link-underline shrink-0 text-sm font-semibold text-earth-foreground"
            >
              Visit the foundation →
            </Link>
          </div>
        </div>

        <Ornament className="my-10 opacity-60" />
        <div className="flex flex-col gap-3 text-xs text-earth-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {JOURNAL.title}. {JOURNAL.format} journal, published{" "}
            {JOURNAL.frequency.toLowerCase()} by {JOURNAL.publisher.name}. ISSN: To Be Issued.
          </p>
          <p>Open abstracts · Double-anonymous peer review · Content licensed CC BY-NC 4.0</p>
        </div>
      </Container>
    </footer>
  );
}
