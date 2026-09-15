import { ConferenceCard } from "@/components/site/ConferenceCard";
import {
  Action,
  Container,
  MetaRow,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { conferences } from "@/data/content";
import { conferencesMeta } from "@/data/pages";

export const metadata = conferencesMeta;

export default function ConferencesPage() {
  const upcoming = conferences.filter((c) => c.status !== "Archived");
  const archived = conferences.filter((c) => c.status === "Archived");

  return (
    <>
      <PageHero
        eyebrow="Convenings"
        title="Conferences"
        lede="Life Sutra convenes and co-hosts academic gatherings where research in progress is tested before publication."
        meta={[`${upcoming.length} upcoming`, "Hybrid participation", "Proceedings indexed"]}
      >
        <Action to="/submit-research" variant="primary" size="sm">
          Submit to a call for papers
        </Action>
      </PageHero>

      <Section>
        <Container>
          <SectionHeading eyebrow="Calendar" title="Upcoming and open" />
          <ul className="grid gap-5">
            {upcoming.map((c) => (
              <ConferenceCard key={c.id} conference={c} />
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="parchment">
        <Container>
          <SectionHeading eyebrow="Archive" title="Past convenings" />
          <ul className="divide-y divide-rule border-y border-rule">
            {archived.map((c) => (
              <li key={c.id} className="py-5">
                <h3 className="text-base leading-snug">{c.title}</h3>
                <MetaRow className="mt-2" items={[c.host, c.dates, c.location]} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
