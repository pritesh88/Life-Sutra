import { Download, Eye } from "lucide-react";
import type { Paper } from "@/data/content";
import { Action, Card, MetaRow, Tag } from "@/components/site/primitives";

type PaperCardProps = {
  paper: Paper;
  /** Compact card for home / listings without full abstract. */
  variant?: "full" | "summary";
};

export function PaperCard({ paper, variant = "full" }: PaperCardProps) {
  if (variant === "summary") {
    return (
      <Card as="li" className="justify-between p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="saffron">{paper.type}</Tag>
            <Tag>{paper.domain}</Tag>
          </div>
          <h3 className="mt-4 text-lg leading-snug">{paper.title}</h3>
          <p className="mt-3 text-sm text-muted-foreground">{paper.authors.join(", ")}</p>
        </div>
        <div className="mt-5 border-t border-rule pt-4">
          <MetaRow items={[paper.date, paper.issue]} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag tone="leaf">Open access</Tag>
            <Tag tone="gold">Peer reviewed</Tag>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card as="li" className="p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone="saffron">{paper.type}</Tag>
        <Tag>{paper.domain}</Tag>
        {paper.status ? (
          <Tag tone={paper.status === "Published" ? "leaf" : "gold"}>{paper.status}</Tag>
        ) : null}
        <span className="font-mono text-xs text-muted-foreground">{paper.id}</span>
      </div>
      <h3 className="mt-4 text-xl leading-snug sm:text-2xl">{paper.title}</h3>
      <p className="mt-2 text-sm font-semibold">{paper.authors.join(" · ")}</p>
      <MetaRow className="mt-1" items={[paper.affiliation]} />
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {paper.abstract}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4">
        <MetaRow items={[paper.date, `pp. ${paper.pages}`, paper.keywords.join(", ")]} />
        {paper.downloadUrl ? (
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={paper.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              <Eye className="size-4" aria-hidden="true" />
              View
            </a>
            <a
              href={paper.downloadUrl}
              download
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
            >
              <Download className="size-4" aria-hidden="true" />
              Download
            </a>
          </div>
        ) : (
          <Action to="/membership" variant="quiet" size="none">
            Full text (members) →
          </Action>
        )}
      </div>
    </Card>
  );
}
