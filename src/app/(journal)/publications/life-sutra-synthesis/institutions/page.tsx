import { ComingSoon } from "@/components/site/ComingSoon";
import { Action, Container, PageHero, Section } from "@/components/site/primitives";
import { institutionsMeta } from "@/data/pages";

export const metadata = institutionsMeta;

export default function InstitutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Network"
        title="Institutions"
        lede="Partnerships that supply archives, laboratories, field sites and reviewers, and that co-host convenings with the journal. This section is being prepared by the editorial team."
        meta={["In preparation"]}
      >
        <Action to="/membership" variant="primary" size="sm">
          Institutional access
        </Action>
      </PageHero>

      <Section>
        <Container>
          <ComingSoon
            title="The institutional directory is in preparation"
            purpose={[
              "Partner universities, archives, research centres and policy institutes will be listed here once formal collaborations are confirmed.",
              "Each listing will state the partnership's focus and the nature of the collaboration.",
            ]}
          />
        </Container>
      </Section>
    </>
  );
}
