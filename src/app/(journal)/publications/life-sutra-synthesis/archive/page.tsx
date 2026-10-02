import { journalPath } from "@/lib/routes";
import Link from "next/link";
import { Card, Container, PageHero, Section, SectionHeading } from "@/components/site/primitives";
import { papers } from "@/data/content";
import {
  JOURNAL,
  articlePath,
  issueNumberLabel,
  issuePath,
  issuePeriodLabel,
  journalIssues,
} from "@/data/journal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Archive",
  description: `Archive of all volumes and issues of ${JOURNAL.title}, with every article listed individually.`,
  path: journalPath("/archive"),
});

export default function ArchivePage() {
  const years = Array.from(new Set(journalIssues.map((i) => i.year)));

  return (
    <>
      <PageHero
        eyebrow="Journal archive"
        title="Archive"
        lede={`Every issue of ${JOURNAL.title}, published ${JOURNAL.frequency.toLowerCase()} since ${JOURNAL.startingYear}. Each article has its own page with full bibliographic details.`}
        meta={[
          `${JOURNAL.frequency}`,
          `${JOURNAL.format} publication`,
          `Since ${JOURNAL.startingYear}`,
          `ISSN (Online): ${JOURNAL.issn}`,
        ]}
      />

      <Section>
        <Container>
          {years.map((year) => (
            <div key={year} className="mb-14 last:mb-0">
              <SectionHeading eyebrow="Year" title={String(year)} />
              <ul className="grid gap-6">
                {journalIssues
                  .filter((i) => i.year === year)
                  .map((issue) => {
                    const articles = papers.filter((p) => p.issueId === issue.id);
                    return (
                      <Card key={issue.id} as="li" className="p-6 sm:p-7">
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                          <h3 className="text-xl leading-snug">
                            <Link
                              href={issuePath(issue)}
                              className="hover:text-primary hover:underline"
                            >
                              {issueNumberLabel(issue)} — {issuePeriodLabel(issue)}
                            </Link>
                          </h3>
                          <p className="text-xs tracking-wide text-muted-foreground">
                            Published {issue.publishedOn} · {articles.length} articles
                          </p>
                        </div>
                        <ol className="mt-5 grid gap-3 border-t border-rule pt-5">
                          {articles.map((a, idx) => (
                            <li key={a.id} className="flex gap-3 text-sm leading-relaxed">
                              <span className="font-mono text-xs text-primary">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <span>
                                <Link
                                  href={articlePath(a.id)}
                                  className="font-semibold text-ink hover:text-primary hover:underline"
                                >
                                  {a.title}
                                </Link>
                                <span className="block text-muted-foreground">
                                  {a.authors.join(", ")} · pp. {a.pages}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ol>
                      </Card>
                    );
                  })}
              </ul>
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}
