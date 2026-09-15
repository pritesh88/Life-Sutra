import type { Researcher } from "@/data/content";
import { Card, MetaRow, Tag } from "@/components/site/primitives";

function initials(name: string) {
  return name
    .replace(/^(Dr\.|Prof\.|Ar\.)\s*/, "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

type ResearcherCardProps = {
  researcher: Researcher;
  variant?: "full" | "summary";
};

export function ResearcherCard({ researcher, variant = "full" }: ResearcherCardProps) {
  if (variant === "summary") {
    return (
      <Card as="li" className="p-5">
        <h4 className="text-base leading-snug">{researcher.name}</h4>
        <MetaRow className="mt-2" items={[researcher.title, researcher.institution]} />
        <p className="mt-3 font-mono text-xs text-primary">{researcher.publications} publications</p>
      </Card>
    );
  }

  return (
    <Card as="li" className="p-6">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full border border-gold/50 bg-parchment font-display text-base text-earth"
        >
          {initials(researcher.name)}
        </span>
        <div>
          <h3 className="text-lg leading-tight">{researcher.name}</h3>
          <p className="text-xs text-muted-foreground">{researcher.title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold">{researcher.institution}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{researcher.focus}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {researcher.domains.map((d) => (
          <li key={d}>
            <Tag>{d}</Tag>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-rule pt-4 font-mono text-xs text-primary">
        {researcher.publications} publications
      </p>
    </Card>
  );
}
