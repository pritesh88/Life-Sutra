import { ResearcherCard } from "@/components/site/ResearcherCard";
import {
  Action,
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { researchers } from "@/data/content";
import { researchersMeta } from "@/data/pages";

export const metadata = researchersMeta;

export default function ResearchersPage() {
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
              <ResearcherCard key={r.id} researcher={r} />
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
