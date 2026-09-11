import { createFileRoute } from "@tanstack/react-router";
import {
  Action,
  Card,
  Container,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { researchers } from "@/data/content";

export const Route = createFileRoute("/researchers")({
  head: () => ({
    meta: [
      { title: "Researcher Directory — Life Sutra" },
      {
        name: "description",
        content:
          "Directory of scholars publishing Indian Knowledge Systems research with Life Sutra, listed by domain, institution and research focus.",
      },
      { property: "og:title", content: "Researcher Directory — Life Sutra" },
      {
        property: "og:description",
        content: "Scholars contributing IKS research across philology, science, policy and history.",
      },
    ],
  }),
  component: ResearchersPage,
});

function initials(name: string) {
  return name
    .replace(/^(Dr\.|Prof\.|Ar\.)\s*/, "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function ResearchersPage() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        title="Researchers"
        lede="Contributing scholars across twelve domains and twenty-seven countries. Profiles will later link directly to publications, reviews and synthesis threads."
        meta={[`${researchers.length} profiles shown`, "1,240 contributors", "Verified affiliations"]}
      >
        <Action to="/membership" variant="primary" size="sm">
          Claim a researcher profile
        </Action>
      </PageHero>

      <Section>
        <Container>
          <SectionHeading eyebrow="Directory" title="Featured contributors" />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {researchers.map((r) => (
              <Card key={r.id} as="li" className="p-6">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="grid size-12 place-items-center rounded-full border border-gold/50 bg-parchment font-display text-base text-earth"
                  >
                    {initials(r.name)}
                  </span>
                  <div>
                    <h3 className="text-lg leading-tight">{r.name}</h3>
                    <p className="text-xs text-muted-foreground">{r.title}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold">{r.institution}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.focus}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {r.domains.map((d) => (
                    <li key={d}>
                      <Tag>{d}</Tag>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-rule pt-4 font-mono text-xs text-primary">
                  {r.publications} publications
                </p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
