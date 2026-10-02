import Link from "next/link";
import { Wrap } from "./Wrap";
import { FOUNDATION, foundationAddress, publications } from "@/data/foundation";
import { FOUNDATION_ROUTES } from "@/lib/routes";
import { PublicationMark } from "./PublicationMark";

const FOUNDATION_LINKS = [
  { label: "Home", to: FOUNDATION_ROUTES.home },
  { label: "About the Foundation", to: FOUNDATION_ROUTES.about },
  { label: "Vision & Mission", to: FOUNDATION_ROUTES.visionMission },
  { label: "Our Approach", to: FOUNDATION_ROUTES.approach },
  { label: "Books", to: FOUNDATION_ROUTES.books },
  { label: "Smart Assessment", to: "/#assessment" },
  { label: "Contact", to: FOUNDATION_ROUTES.contact },
];

export function FoundationFooter() {
  const year = new Date().getFullYear();
  const { contact } = FOUNDATION;

  return (
    <footer className="bg-islf-indigo-deep text-islf-ivory">
      <Wrap className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1.2fr_1fr]">
          <div>
            <p className="islf-kicker text-[0.62rem] text-[var(--islf-glow)]">Publishing body</p>
            <p className="mt-4 font-islf-serif text-2xl leading-snug">{FOUNDATION.name}</p>
            <p className="mt-1 text-sm text-islf-ivory/70">
              ({FOUNDATION.shortName}), {FOUNDATION.country} · {FOUNDATION.legalForm}
            </p>
            <p className="mt-5 max-w-xs font-islf-serif text-lg leading-snug text-islf-ivory/85 italic">
              {FOUNDATION.tagline}
            </p>
          </div>

          <nav aria-label="Foundation">
            <p className="islf-kicker text-[0.62rem] text-islf-ivory/55">Foundation</p>
            <ul className="mt-5 grid gap-2.5 text-sm">
              {FOUNDATION_LINKS.map((l) => (
                <li key={l.to}>
                  <Link href={l.to} className="text-islf-ivory/80 hover:text-islf-ivory">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Publications">
            <p className="islf-kicker text-[0.62rem] text-islf-ivory/55">Publications</p>
            <ul className="mt-5 grid gap-4">
              {publications.map((p) => (
                <li key={p.slug}>
                  <Link href={p.href} className="group flex items-center gap-3">
                    <PublicationMark slug={p.slug} />
                    <span>
                      <span className="block font-islf-serif text-lg leading-tight group-hover:underline">
                        {p.title}
                      </span>
                      <span className="block text-xs text-islf-ivory/60">
                        {p.designation} · {p.status}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={FOUNDATION_ROUTES.publications}
              className="mt-5 inline-block text-sm font-semibold text-[var(--islf-glow)] hover:text-islf-ivory"
            >
              All publications →
            </Link>
          </nav>

          <div>
            <p className="islf-kicker text-[0.62rem] text-islf-ivory/55">Contact</p>
            <address className="mt-5 grid gap-1.5 text-sm text-islf-ivory/80 not-italic">
              <span className="text-islf-ivory">
                {contact.person}, {contact.designation}
              </span>
              <a href={`mailto:${contact.email}`} className="hover:text-islf-ivory">
                {contact.email}
              </a>
              <a href={contact.phoneHref} className="hover:text-islf-ivory">
                {contact.phone}
              </a>
              <span>{foundationAddress()}</span>
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-islf-ivory/15 pt-6 text-xs text-islf-ivory/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {FOUNDATION.name}. Publisher of Life Sutra Synthesis and Life Sutra.
          </p>
          <p>
            Founded on {FOUNDATION.mahavakya.transliteration} — &ldquo;
            {FOUNDATION.mahavakya.translation}&rdquo;
          </p>
        </div>
      </Wrap>
    </footer>
  );
}
