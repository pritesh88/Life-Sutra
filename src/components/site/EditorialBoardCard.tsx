import Image from "next/image";
import { Linkedin, ExternalLink } from "lucide-react";
import type { EditorialBoardMember } from "@/data/content";
import { Card, Tag } from "@/components/site/primitives";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-relaxed">
      <span className="font-semibold text-ink">{label}: </span>
      <span className="text-muted-foreground">{value}</span>
    </p>
  );
}

export function EditorialBoardCard({ member }: { member: EditorialBoardMember }) {
  return (
    <Card as="li" className="items-center p-6 text-center">
      <Image
        src={member.photo}
        alt={member.name}
        width={128}
        height={128}
        className="size-28 rounded-full border border-border object-cover shadow-card"
      />
      <div className="mt-5 w-full text-left">
        <div className="text-center">
          <Tag tone="saffron">{member.editorialDesignation}</Tag>
          <h3 className="mt-3 font-display text-xl leading-snug text-ink">{member.name}</h3>
        </div>

        <div className="mt-4 grid gap-2 border-t border-rule pt-4">
          <Field label="Editorial Designation" value={member.editorialDesignation} />
          {member.academicDesignation ? (
            <Field label="Designation" value={member.academicDesignation} />
          ) : null}
          {member.department ? <Field label="Department" value={member.department} /> : null}
          <Field label="Institution" value={member.organization} />
          {member.address ? <Field label="Institutional Address" value={member.address} /> : null}
          <Field label="Country" value={member.country} />
          {member.email ? <Field label="Official Email" value={member.email} /> : null}
        </div>

        {member.linkedin || member.website ? (
          <div className="mt-4 grid gap-2 border-t border-rule pt-4">
            {member.website ? (
              <a
                href={member.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                Institutional Profile
              </a>
            ) : null}
            {member.linkedin ? (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                <Linkedin className="size-3.5" aria-hidden="true" />
                LinkedIn Profile
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
