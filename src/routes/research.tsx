import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
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
import { domains, papers } from "@/data/content";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Papers — Life Sutra Journal" },
      {
        name: "description",
        content:
          "Peer-reviewed research papers on Indian Knowledge Systems: textual studies, field studies, reviews and methodology notes.",
      },
      { property: "og:title", content: "Research Papers — Life Sutra" },
      {
        property: "og:description",
        content: "Browse peer-reviewed Indian Knowledge Systems research by issue and domain.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const issues = Array.from(new Set(papers.map((p) => p.issue)));

  return (
    <>
      <PageHero
        eyebrow="Peer-reviewed archive"
        title="Research"
        lede="Explore published studies and newly submitted manuscripts across Indian Knowledge Systems. Submission labels describe archive status and do not indicate peer-review acceptance."
        meta={[`${papers.length} papers shown`, `${issues.length} issues`, "Open abstracts"]}
      >
        <div className="flex flex-wrap gap-2">
          <Tag tone="saffron">All domains</Tag>
          {domains.slice(0, 5).map((d) => (
            <Tag key={d}>{d}</Tag>
          ))}
          <Tag>+{domains.length - 5} more</Tag>
        </div>
      </PageHero>

      <Section>
        <Container>
          {issues.map((issue) => (
            <div key={issue} className="mb-14 last:mb-0">
              <SectionHeading eyebrow="Issue" title={issue} />
              <ul className="grid gap-5">
                {papers
                  .filter((p) => p.issue === issue)
                  .map((p) => (
                    <Card key={p.id} as="li" className="p-6 sm:p-7">
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag tone="saffron">{p.type}</Tag>
                        <Tag>{p.domain}</Tag>
                        {p.status ? (
                          <Tag tone={p.status === "Published" ? "leaf" : "gold"}>{p.status}</Tag>
                        ) : null}
                        <span className="font-mono text-xs text-muted-foreground">{p.id}</span>
                      </div>
                      <h3 className="mt-4 text-xl leading-snug sm:text-2xl">{p.title}</h3>
                      <p className="mt-2 text-sm font-semibold">{p.authors.join(" · ")}</p>
                      <MetaRow className="mt-1" items={[p.affiliation]} />
                      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {p.abstract}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4">
                        <MetaRow items={[p.date, `pp. ${p.pages}`, p.keywords.join(", ")]} />
                        {p.downloadUrl ? (
                          <a
                            href={p.downloadUrl}
                            download
                            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                          >
                            <Download className="size-4" aria-hidden="true" />
                            Download paper
                          </a>
                        ) : (
                          <Action to="/membership" variant="quiet" size="none">
                            Full text (members) →
                          </Action>
                        )}
                      </div>
                    </Card>
                  ))}
              </ul>
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}
