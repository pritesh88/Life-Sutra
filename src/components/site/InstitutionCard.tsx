import type { Institution } from "@/data/content";
import { Card, MetaRow, Tag } from "@/components/site/primitives";

type InstitutionCardProps = {
  institution: Institution;
  variant?: "full" | "summary";
};

export function InstitutionCard({ institution, variant = "full" }: InstitutionCardProps) {
  if (variant === "summary") {
    return (
      <Card as="li" className="p-5">
        <h4 className="text-base leading-snug">{institution.name}</h4>
        <MetaRow className="mt-2" items={[institution.type, institution.location]} />
        <p className="mt-3 font-mono text-xs text-primary">
          {institution.collaborations} collaborations
        </p>
      </Card>
    );
  }

  return (
    <Card as="li" className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg leading-snug">{institution.name}</h3>
        <Tag tone="leaf">{institution.type}</Tag>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{institution.focus}</p>
      <MetaRow
        className="mt-5 border-t border-rule pt-4"
        items={[institution.location, `${institution.collaborations} joint projects`]}
      />
    </Card>
  );
}
