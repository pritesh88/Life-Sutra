import { ComingSoon } from "@/components/site/ComingSoon";
import { Container, PageHero, Section } from "@/components/site/primitives";
import { researchersMeta } from "@/data/pages";

export const metadata = researchersMeta;

export default function ResearchersPage() {
  return (
    <>
      <PageHero
        eyebrow="Community"
        title="Researchers"
        lede="A directory of contributing scholars, linked to their publications, reviews and synthesis threads. This section is being prepared by the editorial team."
        meta={["In preparation"]}
      />

      <Section>
        <Container>
          <ComingSoon
            title="The researcher directory is in preparation"
            purpose={[
              "Verified scholar profiles will appear here as researchers publish or join the review pool.",
              "Each profile will link to that researcher's published work and domains of focus.",
            ]}
          />
        </Container>
      </Section>
    </>
  );
}
