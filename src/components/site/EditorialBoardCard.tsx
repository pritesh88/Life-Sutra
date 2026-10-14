import Image from "next/image";
import type { ReactNode } from "react";
import { BadgeCheck, ExternalLink, GraduationCap, Linkedin } from "lucide-react";
import type { EditorialBoardMember } from "@/data/content";
import { Card, Tag } from "@/components/site/primitives";

function ProfileLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
    >
      {icon}
      {label}
    </a>
  );
}

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

        {member.googleScholar || member.orcid || member.website || member.linkedin ? (
          <div className="mt-4 grid gap-2 border-t border-rule pt-4">
            {member.googleScholar ? (
              <ProfileLink
                href={member.googleScholar}
                icon={<GraduationCap className="size-3.5" aria-hidden="true" />}
                label="Google Scholar"
              />
            ) : null}
            {member.orcid ? (
              <ProfileLink
                href={member.orcid}
                icon={<BadgeCheck className="size-3.5" aria-hidden="true" />}
                label="ORCID"
              />
            ) : null}
            {member.website ? (
              <ProfileLink
                href={member.website}
                icon={<ExternalLink className="size-3.5" aria-hidden="true" />}
                label={member.websiteLabel ?? "Institutional Profile"}
              />
            ) : null}
            {member.linkedin ? (
              <ProfileLink
                href={member.linkedin}
                icon={<Linkedin className="size-3.5" aria-hidden="true" />}
                label="LinkedIn Profile"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
