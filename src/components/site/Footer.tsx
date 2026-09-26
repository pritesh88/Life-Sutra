import Image from "next/image";
import Link from "next/link";
import { footerGroups } from "@/data/navigation";
import { ASSETS, SITE_EMAIL } from "@/lib/site";
import { Container, Eyebrow, Ornament } from "./primitives";
import { AssessmentWidget } from "./AssessmentWidget";

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
            <p className="mt-3 text-md">Life Sutra Systhesis</p>
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
          <div className="max-w-sm md:col-start-4 md:row-start-2">
            <Link href={`http://manasyog.life/`} target="_blank">
              <Image
                src={ASSETS.ismartlifelogo}
                alt="Life Sutra Synthesis — Journal of Mind, Consciousness Studies, and Synthesis of Indian Knowledge Systems"
                className="h-28 w-auto rounded-md bg-white/95 p-2 zoom-125"
                width={280}
                height={280}
              /></Link>
            <p className="mt-3 text-md">I Smart Life Foundation</p>
            <p className="mt-3 text-sm leading-relaxed text-earth-foreground/75">
              I Smart Life Foundation, a Section 8 Company, is founded on the guiding Mahavakya from the
              Upanishads, Ayam Atma Brahma—"This Self is Brahman."
            </p>
            <p className="mt-5 text-xs tracking-wide text-earth-foreground/60">ismart@manasyog.com</p>
          </div>
          <div className="md:col-span-3 md:col-start-1 md:row-start-2 md:self-stretch">
            <AssessmentWidget />
          </div>
        </div>

        <Ornament className="my-10 opacity-60" />
        <div className="flex flex-col gap-3 text-xs text-earth-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Life Sutra Synthesis. Published quarterly. ISSN: Coming Soon.</p>
          <p>Open abstracts · Double-anonymous peer review · Content licensed CC BY-NC 4.0</p>
        </div>
      </Container>
    </footer >
  );
}
