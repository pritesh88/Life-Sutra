import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BadgeCheck, ExternalLink, GraduationCap, Linkedin, Mail } from "lucide-react";
import { Wrap } from "@/components/foundation/Wrap";
import { type EditorialBoardMember, editorialBoardGroups } from "@/data/content";
import { IMPRINT } from "@/data/life-sutra";
import { IMPRINT_BASE } from "@/lib/routes";
import { pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = pageMeta({
  title: "Editorial Board",
  description: `Editorial Board of ${IMPRINT.title}, published by ${IMPRINT.publisher}: names, designations, departments, institutional addresses, official email IDs and profile links of each member.`,
  path: `${IMPRINT_BASE}/editorial-board`,
  siteName: "Life Sutra",
});

const { chief, national, international } = editorialBoardGroups();

/** Chapter opener: a roman numeral and a small-caps label, as on the Life Sutra home page. */
function Chapter({ n, label }: { n: string; label: string }) {
  return (
    <p className="flex items-baseline gap-4 text-imprint-copper-text">
      <span className="font-imprint-display text-[1.6rem] leading-none italic">{n}</span>
      <span className="h-px w-10 translate-y-[-0.3rem] bg-imprint-copper/60" aria-hidden="true" />
      <span className="islf-kicker text-[0.62rem]">{label}</span>
    </p>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[0.6rem] font-semibold tracking-[0.18em] text-imprint-muted uppercase">
        {label}
      </dt>
      <dd className="mt-1 font-imprint-body text-[1.02rem] leading-relaxed text-imprint-ink">
        {children}
      </dd>
    </div>
  );
}

function ProfileLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-imprint-burgundy underline decoration-imprint-copper/60 underline-offset-4 transition-colors hover:text-imprint-burgundy-deep"
    >
      {icon}
      {label}
    </a>
  );
}

function MemberCard({ member }: { member: EditorialBoardMember }) {
  return (
    <li className="relative flex flex-col border border-imprint-line bg-imprint-paper p-7">
      <span className="absolute top-0 left-0 size-2 bg-imprint-copper/70" aria-hidden="true" />
      <span className="absolute right-0 bottom-0 size-2 bg-imprint-copper/70" aria-hidden="true" />
      <div className="flex items-center gap-5">
        <Image
          src={member.photo}
          alt={member.name}
          width={96}
          height={96}
          className="size-20 shrink-0 rounded-full border border-imprint-line object-cover"
        />
        <div className="min-w-0">
          <p className="islf-kicker text-[0.58rem] text-imprint-copper-text">
            {member.editorialDesignation}
          </p>
          <h3 className="mt-1.5 font-imprint-display text-[1.65rem] leading-tight text-imprint-ink">
            {member.name}
          </h3>
        </div>
      </div>

      <dl className="mt-6 grid flex-1 content-start gap-4 border-t border-imprint-line pt-6">
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
              className="inline-flex items-center gap-1.5 break-all underline decoration-imprint-copper underline-offset-4 hover:text-imprint-burgundy"
            >
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              {member.email}
            </a>
          </Field>
        ) : null}
      </dl>

      {member.googleScholar || member.orcid || member.website || member.linkedin ? (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-imprint-line pt-5">
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
  n,
  label,
  title,
  lede,
  members,
  className,
}: {
  id: string;
  n: string;
  label: string;
  title: string;
  lede: string;
  members: EditorialBoardMember[];
  className: string;
}) {
  if (members.length === 0) return null;
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-32 py-20 sm:py-24", className)}
    >
      <Wrap>
        <Chapter n={n} label={label} />
        <h2 id={`${id}-title`} className="mt-6 text-[2.4rem] leading-[1.05] sm:text-[3rem]">
          {title}
        </h2>
        <p className="mt-4 max-w-xl font-imprint-body text-[1.1rem] leading-relaxed text-imprint-muted">
          {lede}
        </p>
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </ul>
      </Wrap>
    </section>
  );
}

export default function LifeSutraEditorialBoardPage() {
  return (
    <>
      <header className="border-b border-imprint-line bg-imprint-parchment">
        <Wrap className="flex flex-col items-center py-20 text-center sm:py-24">
          <nav aria-label="Breadcrumb" className="text-xs text-imprint-muted">
            <Link href={IMPRINT_BASE} className="hover:text-imprint-burgundy hover:underline">
              {IMPRINT.title}
            </Link>
            <span className="px-2">/</span>
            <span aria-current="page">Editorial Board</span>
          </nav>
          <span className="mt-8 h-px w-10 bg-imprint-copper" aria-hidden="true" />
          <h1 className="mt-6 font-imprint-display text-[3rem] leading-none text-imprint-burgundy italic sm:text-[4rem]">
            Editorial Board
          </h1>
          <p className="mt-6 max-w-xl font-imprint-body text-[1.15rem] leading-relaxed text-imprint-muted">
            The scholars and practitioners who set editorial policy and review standards for{" "}
            {IMPRINT.title}, published by {IMPRINT.publisher}.
          </p>
        </Wrap>
      </header>
      <MemberGroup
        id="editor-in-chief"
        n="I."
        label="Leadership"
        title="Editor-in-Chief"
        lede="Holds final responsibility for the journal's editorial policy and publication decisions."
        members={chief}
        className="bg-imprint-paper"
      />
      <MemberGroup
        id="board-members"
        n="II."
        label="India"
        title="Editorial Board Members"
        lede="Members drawn from universities, research institutes and professional practice across India."
        members={national}
        className="border-t border-imprint-line bg-imprint-parchment"
      />
      <MemberGroup
        id="international-members"
        n="III."
        label="International"
        title="International Editorial Board Members"
        lede="Members based outside India who bring an international perspective to review and editorial policy."
        members={international}
        className="border-t border-imprint-line bg-imprint-paper"
      />
    </>
  );
}
