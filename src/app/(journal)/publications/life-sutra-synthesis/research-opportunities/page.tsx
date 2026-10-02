import { ComingSoon } from "@/components/site/ComingSoon";
import { Action, Container, PageHero, Section } from "@/components/site/primitives";
import { opportunitiesMeta } from "@/data/pages";

export const metadata = opportunitiesMeta;

export default function OpportunitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Openings"
        title="Research Opportunities"
        lede="Funded positions, grants and calls relevant to Indian Knowledge Systems scholars. This section is being prepared by the editorial team."
        meta={["In preparation"]}
      >
        <Action to="/membership" variant="outline" size="sm">
          Get notified when listings open
        </Action>
      </PageHero>

      <Section>
        <Container>
          <ComingSoon
            title="Opportunity listings are in preparation"
            purpose={[
              "Fellowships, grants, doctoral positions and calls for chapters will be listed here once verified.",
              "Each listing will state the host organisation, funding, location and deadline as published by the source.",
            ]}
          />
        </Container>
      </Section>
    </>
  );
}
