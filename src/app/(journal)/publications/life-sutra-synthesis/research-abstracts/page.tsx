import { ComingSoon } from "@/components/site/ComingSoon";
import { Container, PageHero, Section } from "@/components/site/primitives";
import { abstractsMeta } from "@/data/pages";

export const metadata = abstractsMeta;

export default function AbstractsPage() {
  return (
    <>
      <PageHero
        eyebrow="Open index"
        title="Research Abstracts"
        lede="Abstracts will be published as soon as a submission clears desk review, so the field can see work in progress rather than waiting for the issue. This section is being prepared by the editorial team."
        meta={["In preparation"]}
      />

      <Section>
        <Container>
          <ComingSoon
            title="The abstract index is in preparation"
            purpose={[
              "Submissions will be indexed here as soon as they clear desk review.",
              "Status will reflect position in the review pipeline, not editorial endorsement.",
            ]}
          />
        </Container>
      </Section>
    </>
  );
}
