import { ComingSoon } from "@/components/site/ComingSoon";
import { Action, Container, PageHero, Section } from "@/components/site/primitives";
import { whitePapersMeta } from "@/data/pages";

export const metadata = whitePapersMeta;

export default function WhitePapersPage() {
  return (
    <>
      <PageHero
        eyebrow="Frameworks & policy"
        title="White Papers"
        lede="Documents that set standards rather than report findings: integrity requirements, metadata crosswalks, evidence rubrics and infrastructure proposals. This section is being prepared by the editorial team."
        meta={["In preparation"]}
      />

      <Section>
        <Container>
          <ComingSoon
            title="The white paper library is being prepared"
            purpose={[
              "Standards and policy documents will be published here as they are adopted by the editorial council.",
              "Draft documents will open for a consultation period before adoption.",
              "Each document will list its issuing body, date and page count.",
            ]}
          />
          <div className="mt-8 flex justify-center">
            <Action to="/about" variant="outline" size="sm">
              About Life Sutra Synthesis
            </Action>
          </div>
        </Container>
      </Section>
    </>
  );
}
