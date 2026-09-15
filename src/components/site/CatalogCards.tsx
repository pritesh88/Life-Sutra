import type { Opportunity, WhitePaper } from "@/data/content";
import { Action, Card, MetaRow, Tag } from "@/components/site/primitives";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Card as="li" className="p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tag tone="saffron">{opportunity.type}</Tag>
        <span className="text-xs font-semibold text-primary">Closes {opportunity.deadline}</span>
      </div>
      <h3 className="mt-4 text-xl leading-snug">{opportunity.title}</h3>
      <p className="mt-2 text-sm font-semibold">{opportunity.organisation}</p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {opportunity.summary}
      </p>
      <MetaRow
        className="mt-5 border-t border-rule pt-4"
        items={[opportunity.location, opportunity.funding]}
      />
    </Card>
  );
}

export function WhitePaperCard({
  paper,
  variant = "full",
}: {
  paper: WhitePaper;
  variant?: "full" | "gap";
}) {
  if (variant === "gap") {
    return (
      <Card as="li" className="justify-between p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="leaf">Open for research</Tag>
            <Tag>{paper.theme}</Tag>
          </div>
          <h3 className="mt-4 text-lg leading-snug">{paper.title}</h3>
          <p className="mt-3 text-xs font-semibold tracking-wide uppercase">Research gap</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{paper.summary}</p>
        </div>
        <div className="mt-5">
          <Action to="/submit-research" variant="quiet" size="none">
            I want to research this →
          </Action>
        </div>
      </Card>
    );
  }

  return (
    <Card as="li" className="p-6">
      <Tag tone="saffron">{paper.theme}</Tag>
      <h3 className="mt-4 text-xl leading-snug">{paper.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{paper.summary}</p>
      <div className="mt-5 flex items-center justify-between border-t border-rule pt-4">
        <MetaRow items={[paper.issuedBy, `${paper.pages} pp.`, paper.date]} />
      </div>
    </Card>
  );
}
