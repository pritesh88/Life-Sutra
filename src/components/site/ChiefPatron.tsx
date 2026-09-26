import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Card, Container, Eyebrow, Section, Tag } from "@/components/site/primitives";

const chiefPatron = {
  name: "Dr. Vijay P. Bhatkar",
  photo: "/assets/editorial/dr-vijay-bhatkar.jpg",
  honours: ["Padma Bhushan (2015)", "Padma Shri (2000)"],
  summary:
    "Computer scientist, IT leader and educationist, best known as the architect of India's PARAM series of supercomputers. He was the founder Executive Director of the Centre for Development of Advanced Computing (C-DAC), and has served as Chancellor of Nalanda University and as President of Vijnana Bharati.",
  highlights: [
    "Architect of the PARAM supercomputers, India's first indigenous supercomputing programme",
    "Founder Executive Director, Centre for Development of Advanced Computing (C-DAC)",
    "Former Chancellor, Nalanda University",
    "Long-standing advocate for bringing Indian Knowledge Systems into dialogue with modern science",
  ],
  profileUrl: "https://en.wikipedia.org/wiki/Vijay_P._Bhatkar",
};

export function ChiefPatron() {
  return (
    <Section id="chief-patron" className="scroll-mt-24">
      <Container>
        <Card className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[auto_1fr] lg:items-start">
          <div className="flex flex-col items-center text-center lg:w-56">
            <Image
              src={chiefPatron.photo}
              alt={`Portrait of ${chiefPatron.name}`}
              width={480}
              height={638}
              className="h-auto w-48 rounded-md border-2 border-gold/60 bg-white object-cover shadow-card lg:w-56"
              sizes="(max-width: 1024px) 192px, 224px"
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {chiefPatron.honours.map((h) => (
                <Tag key={h} tone="gold">
                  {h}
                </Tag>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>Chief Patron</Eyebrow>
            <h2 className="mt-3 font-display text-2xl leading-snug text-ink sm:text-3xl">
              {chiefPatron.name}
            </h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-foreground">
              {chiefPatron.summary}
            </p>
            <ul className="mt-5 grid gap-2 border-t border-rule pt-5 sm:grid-cols-2">
              {chiefPatron.highlights.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-ink">
              The inaugural issue of Life Sutra Synthesis will be released on{" "}
              <strong>11 October 2026</strong>, marking the 80th birthday of Dr. Vijay Bhatkar.
            </p>
            <a
              href={chiefPatron.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Read full profile
            </a>
          </div>
        </Card>
      </Container>
    </Section>
  );
}

export default ChiefPatron;
