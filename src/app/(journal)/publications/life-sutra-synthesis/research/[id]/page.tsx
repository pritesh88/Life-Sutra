import { journalPath } from "@/lib/routes";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Eye } from "lucide-react";
import { Container, Eyebrow, Section, Tag } from "@/components/site/primitives";
import { papers } from "@/data/content";
import { JOURNAL, articlePath, citation, getIssue, issueLabel, issuePath } from "@/data/journal";
import { pageMeta } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return papers.map((p) => ({ id: p.id }));
}

export const dynamicParams = false;

function findArticle(id: string) {
  const article = papers.find((p) => p.id === id);
  const issue = article ? getIssue(article.issueId) : undefined;
  return article && issue ? { article, issue } : undefined;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const found = findArticle((await params).id);
  if (!found) return {};
  const { article, issue } = found;
  return {
    ...pageMeta({
      title: article.title,
      description: article.abstract,
      path: articlePath(article.id),
    }),
    // Highwire Press tags read by Google Scholar and indexing services.
    other: {
      citation_title: article.title,
      citation_author: article.authors,
      citation_journal_title: JOURNAL.title,
      citation_publisher: JOURNAL.publisher.name,
      citation_publication_date: String(issue.year),
      citation_volume: String(issue.volume),
      citation_issue: String(issue.number),
      citation_firstpage: article.pages.split(/[–-]/)[0] ?? "",
      citation_lastpage: article.pages.split(/[–-]/)[1] ?? "",
      citation_language: "en",
      ...(article.downloadUrl ? { citation_pdf_url: `${getSiteUrl()}${article.downloadUrl}` } : {}),
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const found = findArticle((await params).id);
  if (!found) notFound();
  const { article, issue } = found;

  const bibliographic: [string, ReactNode][] = [
    ["Journal", JOURNAL.title],
    ["ISSN (Online)", JOURNAL.issn],
    ["Volume", issue.volume],
    ["Issue", issue.number],
    ["Period of Publication", `${issue.months} ${issue.year}`],
    ["Published On", issue.publishedOn],
    ["Pages", article.pages],
    ["Article Type", article.type],
    ["Manuscript ID", article.id],
    ["Publisher", JOURNAL.publisher.name],
  ];

  return (
    <>
      <header className="relative overflow-hidden border-b border-border bg-parchment">
        <div className="jaali pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
        <Container className="relative py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-xs tracking-wide text-muted-foreground">
            <Link href={journalPath("/archive")} className="hover:text-primary hover:underline">
              Archive
            </Link>
            <span className="px-2">/</span>
            <Link href={issuePath(issue)} className="hover:text-primary hover:underline">
              {issueLabel(issue)}
            </Link>
          </nav>
          <Eyebrow className="mt-6">
            {JOURNAL.title} · {issueLabel(issue)}
          </Eyebrow>
          <h1 className="mt-4 max-w-4xl text-2xl leading-tight sm:text-[2.2rem]">
            {article.title}
          </h1>
          <p className="mt-4 text-sm font-semibold">{article.authors.join(" · ")}</p>
          <p className="mt-1 text-xs tracking-wide text-muted-foreground">{article.affiliation}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Tag tone="saffron">{article.type}</Tag>
            <Tag>{article.domain}</Tag>
            {article.status ? (
              <Tag tone={article.status === "Published" ? "leaf" : "gold"}>{article.status}</Tag>
            ) : null}
          </div>
        </Container>
      </header>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-xl">Abstract</h2>
            <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-foreground">
              {article.abstract}
            </p>
            <h2 className="mt-8 text-xl">Keywords</h2>
            <p className="mt-3 text-sm text-muted-foreground">{article.keywords.join(", ")}</p>

            {article.downloadUrl ? (
              <div className="mt-8 flex flex-wrap gap-5">
                <a
                  href={article.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  <Eye className="size-4" aria-hidden="true" />
                  View full text (PDF)
                </a>
                <a
                  href={article.downloadUrl}
                  download
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download PDF
                </a>
              </div>
            ) : null}

            <h2 className="mt-10 text-xl">How to cite</h2>
            <p className="mt-3 rounded-md border border-border bg-parchment p-4 text-sm leading-relaxed text-ink">
              {citation(article, issue)}
            </p>
          </div>

          <aside>
            <h2 className="text-xl">Bibliographic details</h2>
            <div className="mt-4 overflow-hidden rounded-md border border-border bg-card">
              <table className="w-full border-collapse text-left text-sm">
                <tbody>
                  {bibliographic.map(([label, value]) => (
                    <tr key={label} className="border-b border-rule last:border-b-0">
                      <th
                        scope="row"
                        className="w-2/5 bg-parchment/60 px-4 py-2.5 align-top font-semibold text-ink"
                      >
                        {label}
                      </th>
                      <td className="px-4 py-2.5 align-top text-muted-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
