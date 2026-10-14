import Image from "next/image";
import type { ReactNode } from "react";
import { BadgeCheck, ExternalLink, GraduationCap, Linkedin, Mail } from "lucide-react";
import { FHeading, FSection, PageIntro } from "@/components/foundation/sections";
import { Wrap } from "@/components/foundation/Wrap";
import { type EditorialBoardMember, editorialBoardGroups } from "@/data/content";
import { FOUNDATION } from "@/data/foundation";
import { JOURNAL } from "@/data/journal";
import { foundationMeta } from "@/lib/foundation-meta";

export const metadata = foundationMeta({
  title: "Editorial Board",
  description: `Editorial Board of ${JOURNAL.title}, published by ${FOUNDATION.name}: names, designations, departments, institutional addresses, official email IDs and profile links of each member.`,
  path: "/editorial-board",
});

const { chief, national, international } = editorialBoardGroups();

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="islf-kicker text-[0.56rem] text-islf-muted">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-islf-ink">{children}</dd>
    </div>
  );
}

function ProfileLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-islf-indigo transition-colors hover:text-islf-ink"
    >
      {icon}
      {label}
    </a>
  );
}

function MemberCard({ member }: { member: EditorialBoardMember }) {
  return (
    <li className="flex flex-col border border-islf-stone bg-islf-paper p-7">
      <div className="flex items-center gap-5">
        <Image
          src={member.photo}
          alt={member.name}
          width={96}
          height={96}
          className="size-20 shrink-0 rounded-full border border-islf-stone object-cover"
        />
        <div className="min-w-0">
          <p className="islf-kicker text-[0.6rem] text-islf-magenta-text">
            {member.editorialDesignation}
          </p>
          <h3 className="mt-2 font-islf-serif text-[1.45rem] leading-snug text-islf-ink">
            {member.name}
          </h3>
        </div>
      </div>

      <dl className="mt-6 grid flex-1 content-start gap-4 border-t border-islf-stone pt-6">
        {member.academicDesignation ? (
          <Field label="Designation">{member.academicDesignation}</Field>
        ) : null}
        {member.department ? <Field label="Department">{member.department}</Field> : null}
        <Field label="Institution / University">{member.organization}</Field>
        {member.address ? <Field label="Institutional Address">{member.address}</Field> : null}
        <Field label="Country">{member.country}</Field>
        {member.email ? (
          <Field label="Official Email">
            <a
              href={`mailto:${member.email}`}
              className="inline-flex items-center gap-1.5 break-all text-islf-indigo hover:text-islf-ink hover:underline"
            >
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              {member.email}
            </a>
          </Field>
        ) : null}
      </dl>

      {member.googleScholar || member.orcid || member.website || member.linkedin ? (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-islf-stone pt-5">
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
    </li>
  );
}

function MemberGroup({
  id,
  tone,
  kicker,
  title,
  lede,
  members,
}: {
  id: string;
  tone: "ivory" | "paper" | "mist";
  kicker: string;
  title: string;
  lede: string;
  members: EditorialBoardMember[];
}) {
  if (members.length === 0) return null;
  return (
    <FSection id={id} tone={tone} labelledBy={`${id}-title`}>
      <Wrap>
        <FHeading id={`${id}-title`} kicker={kicker} title={title} lede={lede} />
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </ul>
      </Wrap>
    </FSection>
  );
}

export default function EditorialBoardPage() {
  return (
    <>
      <PageIntro
        kicker="Governance"
        title="Editorial Board"
        lede={`The scholars and practitioners who set editorial policy and review standards for ${JOURNAL.title} — ${JOURNAL.subtitle} — published by ${FOUNDATION.name}.`}
      />
      <MemberGroup
        id="editor-in-chief"
        tone="mist"
        kicker="Leadership"
        title="Editor-in-Chief"
        lede="Holds final responsibility for the journal's editorial policy and publication decisions."
        members={chief}
      />
      <MemberGroup
        id="board-members"
        tone="paper"
        kicker="India"
        title="Editorial Board Members"
        lede="Members drawn from universities, research institutes and professional practice across India."
        members={national}
      />
      <MemberGroup
        id="international-members"
        tone="ivory"
        kicker="International"
        title="International Editorial Board Members"
        lede="Members based outside India who bring an international perspective to review and editorial policy."
        members={international}
      />
    </>
  );
}
