import { PaperCard } from "@/components/site/PaperCard";
import {
  Container,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { domains, papers } from "@/data/content";
import { researchMeta } from "@/data/pages";

export const metadata = researchMeta;

export default function ResearchPage() {
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
