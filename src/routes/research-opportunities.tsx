import { createFileRoute } from "@tanstack/react-router";
import {
  Action,
  Card,
  Container,
  MetaRow,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { opportunities } from "@/data/content";

export const Route = createFileRoute("/research-opportunities")({
  head: () => ({
    meta: [
      { title: "Research Opportunities — Fellowships, Grants & Calls" },
      {
        name: "description",
        content:
          "Fellowships, grants, doctoral positions and calls for chapters in Indian Knowledge Systems research, with funding and deadline details.",
      },
      { property: "og:title", content: "Research Opportunities — Life Sutra" },
      {
        property: "og:description",
        content: "Current IKS fellowships, grants, doctoral positions and calls for chapters.",
      },
    ],
  }),
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Openings"
        title="Research Opportunities"
        lede="Funded positions, grants and calls collected from partner institutions and the Life Sutra research fund."
        meta={[`${opportunities.length} open listings`, "Verified sources", "Updated fortnightly"]}
      >
        <Action to="/membership" variant="outline" size="sm">
          Get listings by email
        </Action>
      </PageHero>

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Current"
            title="Open calls"
            description="Deadlines are listed as published by the host organisation; verify before applying."
          />
          <ul className="grid gap-5">
            {opportunities.map((o) => (
              <Card key={o.id} as="li" className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Tag tone="saffron">{o.type}</Tag>
                  <span className="text-xs font-semibold text-primary">
                    Closes {o.deadline}
                  </span>
                </div>
                <h3 className="mt-4 text-xl leading-snug">{o.title}</h3>
                <p className="mt-2 text-sm font-semibold">{o.organisation}</p>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {o.summary}
                </p>
                <MetaRow className="mt-5 border-t border-rule pt-4" items={[o.location, o.funding]} />
              </Card>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
