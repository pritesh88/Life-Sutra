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
import { institutions } from "@/data/content";

export const Route = createFileRoute("/institutions")({
  head: () => ({
    meta: [
      { title: "Partner Institutions — Life Sutra" },
      {
        name: "description",
        content:
          "Universities, research centres, archives and policy institutes collaborating with Life Sutra on Indian Knowledge Systems research.",
      },
      { property: "og:title", content: "Partner Institutions — Life Sutra" },
      {
        property: "og:description",
        content: "Universities, archives and policy institutes building IKS research capacity.",
      },
    ],
  }),
  component: InstitutionsPage,
});

function InstitutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Network"
        title="Institutions"
        lede="Partnerships that supply archives, laboratories, field sites and reviewers — and that co-host convenings with the journal."
        meta={["68 partners", "27 countries", "Institutional access available"]}
      >
        <Action to="/membership" variant="primary" size="sm">
          Institutional membership
        </Action>
      </PageHero>

      <Section>
        <Container>
          <SectionHeading eyebrow="Directory" title="Collaborating institutions" />
          <ul className="grid gap-5 md:grid-cols-2">
            {institutions.map((i) => (
              <Card key={i.id} as="li" className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg leading-snug">{i.name}</h3>
                  <Tag tone="leaf">{i.type}</Tag>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{i.focus}</p>
                <MetaRow
                  className="mt-5 border-t border-rule pt-4"
                  items={[i.location, `${i.collaborations} joint projects`]}
                />
              </Card>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
