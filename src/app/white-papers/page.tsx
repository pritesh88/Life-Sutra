import { FileText } from "lucide-react";
import { WhitePaperCard } from "@/components/site/CatalogCards";
import {
  Action,
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { whitePapers } from "@/data/content";
import { whitePapersMeta } from "@/data/pages";

export const metadata = whitePapersMeta;

export default function WhitePapersPage() {
  return (
    <>
      <PageHero
        eyebrow="Frameworks & policy"
        title="White Papers"
        lede="Documents that set standards rather than report findings: integrity requirements, metadata crosswalks, evidence rubrics and infrastructure proposals."
        meta={[`${whitePapers.length} documents`, "Free to download", "Open consultation"]}
      />

      <Section>
        <Container>
          <SectionHeading eyebrow="Library" title="Published documents" />
          <ul className="grid gap-5 md:grid-cols-2">
            {whitePapers.map((w) => (
              <WhitePaperCard key={w.id} paper={w} />
            ))}
          </ul>
          <div className="mt-12 rounded-md border border-border bg-parchment p-8">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <h3 className="text-xl">Comment on a draft</h3>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Standards documents are released for a six-week consultation before adoption.
                  Members and partner institutions receive drafts directly.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Action to="/membership" variant="primary" size="sm">
                    Join to receive drafts
                  </Action>
                  <Action to="/methodology" variant="outline" size="sm">
                    Methodology framework
                  </Action>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
