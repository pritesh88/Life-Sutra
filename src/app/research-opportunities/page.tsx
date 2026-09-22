import { OpportunityCard } from "@/components/site/CatalogCards";
import {
  Action,
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { opportunities } from "@/data/content";
import { opportunitiesMeta } from "@/data/pages";

export const metadata = opportunitiesMeta;

export default function OpportunitiesPage() {
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
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
