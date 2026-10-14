import { EditorialBoardCard } from "@/components/site/EditorialBoardCard";
import { Container, PageHero, Section, SectionHeading } from "@/components/site/primitives";
import { type EditorialBoardMember, editorialBoardGroups } from "@/data/content";
import { JOURNAL } from "@/data/journal";
import { journalPath } from "@/lib/routes";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Editorial Board",
  description: `Editorial Board of ${JOURNAL.title}: names, designations, departments, institutional addresses, official email IDs and profile links of each member.`,
  path: journalPath("/editorial-board"),
});

const { chief, national, international } = editorialBoardGroups();

function MemberGroup({
  id,
  tone,
  eyebrow,
  title,
  description,
  members,
}: {
  id: string;
  tone: "default" | "parchment";
  eyebrow: string;
  title: string;
  description: string;
  members: EditorialBoardMember[];
}) {
  if (members.length === 0) return null;
  return (
    <Section id={id} tone={tone} className="scroll-mt-24">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <EditorialBoardCard key={m.id} member={m} />
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export default function JournalEditorialBoardPage() {
  return (
    <>
      <PageHero
        eyebrow="Governance"
        title="Editorial Board"
        lede={`The scholars and practitioners who set editorial policy and review standards for ${JOURNAL.title} — ${JOURNAL.subtitle}.`}
        meta={[`${JOURNAL.publisher.name}`, JOURNAL.peerReview, `ISSN: ${JOURNAL.issn}`]}
      />
      <MemberGroup
        id="editor-in-chief"
        tone="default"
        eyebrow="Leadership"
        title="Editor-in-Chief"
        description="Holds final responsibility for the journal's editorial policy and publication decisions."
        members={chief}
      />
      <MemberGroup
        id="board-members"
        tone="parchment"
        eyebrow="India"
        title="Editorial Board Members"
        description="Members drawn from universities, research institutes and professional practice across India."
        members={national}
      />
      <MemberGroup
        id="international-members"
        tone="default"
        eyebrow="International"
        title="International Editorial Board Members"
        description="Members based outside India who bring an international perspective to review and editorial policy."
        members={international}
      />
    </>
  );
}
