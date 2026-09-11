import { createFileRoute } from "@tanstack/react-router";
import {
  Action,
  Card,
  Container,
  MetaRow,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { conferences } from "@/data/content";

export const Route = createFileRoute("/conferences")({
  head: () => ({
    meta: [
      { title: "Conferences & Calls for Papers — Life Sutra" },
      {
        name: "description",
        content:
          "Congresses, symposia and methodology colloquia on Indian Knowledge Systems, with calls for papers and registration details.",
      },
      { property: "og:title", content: "Conferences & Calls for Papers — Life Sutra" },
      {
        property: "og:description",
        content: "Upcoming IKS congresses, symposia and colloquia hosted with partner institutions.",
      },
    ],
  }),
  component: ConferencesPage,
});

function ConferencesPage() {
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
              <Card key={c.id} as="li" className="p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag tone={c.status === "Call for Papers" ? "saffron" : "leaf"}>{c.status}</Tag>
                  <Tag>{c.mode}</Tag>
                </div>
                <h3 className="mt-4 text-xl leading-snug">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.host}</p>
                <div className="mt-5 grid gap-4 border-t border-rule pt-4 sm:grid-cols-3">
                  <div>
                    <p className="eyebrow">Dates</p>
                    <p className="mt-1.5 text-sm">{c.dates}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Venue</p>
                    <p className="mt-1.5 text-sm">{c.location}</p>
                  </div>
                  <div>
                    <p className="eyebrow">Submission deadline</p>
                    <p className="mt-1.5 text-sm">{c.deadline}</p>
                  </div>
                </div>
                <MetaRow className="mt-4" items={[`Themes: ${c.themes.join(", ")}`]} />
              </Card>
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
