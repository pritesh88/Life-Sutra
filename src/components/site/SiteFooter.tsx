import { Link } from "@tanstack/react-router";
import { footerGroups } from "@/data/navigation";
import { Container, Eyebrow, Ornament } from "./primitives";
import logo from "@/assets/life-sutra-logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-earth text-earth-foreground">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <img
              src={logo.url}
              alt="Life Sutra — Journal of Mind, Consciousness Studies, and Synthesis of Indian Knowledge Systems"
              className="h-28 w-auto rounded-md bg-white/95 p-2"
              width={280}
              height={280}
            />
            <p className="mt-3 text-sm leading-relaxed text-earth-foreground/75">
              A global research and knowledge platform for Indian Knowledge Systems — publishing
              peer-reviewed scholarship and building the infrastructure that connects it.
            </p>
            <p className="mt-5 text-xs tracking-wide text-earth-foreground/60">
              editorial@lifesutra.org
            </p>
          </div>
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <Eyebrow className="text-earth-foreground/60">{group.title}</Eyebrow>
              <ul className="mt-4 grid gap-2.5 text-sm">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
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
          <p>© {new Date().getFullYear()} Life Sutra. Published quarterly. ISSN 2947-4412.</p>
          <p>Open abstracts · Double-anonymous peer review · Content licensed CC BY-NC 4.0</p>
        </div>
      </Container>
    </footer>
  );
}
