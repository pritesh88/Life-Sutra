import { InstitutionCard } from "@/components/site/InstitutionCard";
import {
  Action,
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { institutions } from "@/data/content";
import { institutionsMeta } from "@/data/pages";

export const metadata = institutionsMeta;

export default function InstitutionsPage() {
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
              <InstitutionCard key={i.id} institution={i} />
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
