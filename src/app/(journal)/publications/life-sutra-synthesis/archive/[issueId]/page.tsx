import { journalPath } from "@/lib/routes";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaperCard } from "@/components/site/PaperCard";
import { Container, PageHero, Section } from "@/components/site/primitives";
import { papers } from "@/data/content";
import { JOURNAL, getIssue, issueLabel, issuePath, journalIssues } from "@/data/journal";
import { pageMeta } from "@/lib/seo";

type Params = { issueId: string };

export function generateStaticParams(): Params[] {
  return journalIssues.map((i) => ({ issueId: i.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const issue = getIssue((await params).issueId);
  if (!issue) return {};
  return pageMeta({
    title: issueLabel(issue),
    description: `Table of contents of ${JOURNAL.title}, ${issueLabel(issue)}.`,
    path: issuePath(issue),
  });
}

export default async function IssuePage({ params }: { params: Promise<Params> }) {
  const issue = getIssue((await params).issueId);
  if (!issue) notFound();

  const articles = papers.filter((p) => p.issueId === issue.id);

  return (
    <>
      <PageHero
        eyebrow={`${JOURNAL.title} · Archive`}
        title={issueLabel(issue)}
        lede={`Table of contents. Published ${issue.publishedOn}. Each article links to its own page with full bibliographic details and PDF.`}
        meta={[
          `Volume ${issue.volume}`,
          `Issue ${issue.number}`,
          `${issue.months} ${issue.year}`,
          `${articles.length} articles`,
          `ISSN (Online): ${JOURNAL.issn}`,
        ]}
      >
        <Link
          href={journalPath("/archive")}
          className="link-underline text-sm font-semibold text-primary"
        >
          ← All issues
        </Link>
      </PageHero>

      <Section>
        <Container>
          <ul className="grid gap-5">
            {articles.map((p) => (
              <PaperCard key={p.id} paper={p} />
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
