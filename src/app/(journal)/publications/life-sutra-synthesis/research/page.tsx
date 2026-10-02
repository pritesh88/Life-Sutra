import { PaperCard } from "@/components/site/PaperCard";
import {
  Action,
  Container,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { domains, papers } from "@/data/content";
import { issueLabel, issuePath, journalIssues } from "@/data/journal";
import { researchMeta } from "@/data/pages";

export const metadata = researchMeta;

export default function ResearchPage() {
  const issues = journalIssues.filter((issue) => papers.some((p) => p.issueId === issue.id));

  return (
    <>
      <PageHero
        eyebrow="Peer-reviewed archive"
        title="Research Publications"
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
            <div key={issue.id} className="mb-14 last:mb-0">
              <SectionHeading
                eyebrow="Issue"
                title={issueLabel(issue)}
                action={
                  <Action to={issuePath(issue)} variant="outline" size="sm">
                    Issue contents
                  </Action>
                }
              />
              <ul className="grid gap-5">
                {papers
                  .filter((p) => p.issueId === issue.id)
                  .map((p) => (
                    <PaperCard key={p.id} paper={p} />
                  ))}
              </ul>
            </div>
          ))}
        </Container>
      </Section>
    </>
  );
}
