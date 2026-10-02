import { ComingSoon } from "@/components/site/ComingSoon";
import { Action, Container, PageHero, Section } from "@/components/site/primitives";
import { conferencesMeta } from "@/data/pages";

export const metadata = conferencesMeta;

export default function ConferencesPage() {
  return (
    <>
      <PageHero
        eyebrow="Convenings"
        title="Conferences"
        lede="Life Sutra Synthesis will convene and co-host academic gatherings where research in progress can be tested before publication. This section is being prepared by the editorial team."
        meta={["In preparation"]}
      >
        <Action to="/submit-research" variant="primary" size="sm">
          Submit to a future call for papers
        </Action>
      </PageHero>

      <Section>
        <Container>
          <ComingSoon
            title="Conference listings are in preparation"
            purpose={[
              "Calls for papers, symposia and colloquia will be listed here as they are confirmed.",
              "Each listing will include host, dates, mode of participation and submission deadline.",
              "Past convenings will be archived here once the first are held.",
            ]}
          />
        </Container>
      </Section>
    </>
  );
}
