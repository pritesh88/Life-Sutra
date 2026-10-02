import { journalPath } from "@/lib/routes";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container, Section, SectionHeading } from "@/components/site/primitives";
import { JOURNAL, issueLabel, issuePath, journalIssues, journalUrl } from "@/data/journal";

type Row = { label: string; value: ReactNode };

export function JournalParticulars() {
  const current = journalIssues[0];

  const rows: Row[] = [
    { label: "Title", value: JOURNAL.title },
    { label: "Subtitle", value: JOURNAL.subtitle },
    { label: "ISSN (Online)", value: JOURNAL.issn },
    { label: "Starting Year", value: JOURNAL.startingYear },
    { label: "Frequency", value: JOURNAL.frequency },
    { label: "Format of Publication", value: `${JOURNAL.format} only` },
    { label: "Subject", value: JOURNAL.subject },
    { label: "Language", value: JOURNAL.language },
    {
      label: "Publication Details (Vol., Issue, Period)",
      value: current ? (
        <Link href={issuePath(current)} className="link-underline text-primary">
          {issueLabel(current)}
        </Link>
      ) : (
        "—"
      ),
    },
    { label: "Publisher", value: JOURNAL.publisher.name },
    { label: "Type of Publisher", value: JOURNAL.publisher.type },
    { label: "Owner", value: JOURNAL.publisher.owner },
    { label: "Publisher's Address", value: JOURNAL.publisher.address },
    { label: "Publisher's Email", value: JOURNAL.publisher.email },
    {
      label: "Editor-in-Chief",
      value: `${JOURNAL.editorInChief.name}, ${JOURNAL.editorInChief.affiliation}`,
    },
    { label: "Journal Website", value: journalUrl() },
  ];

  return (
    <Section id="journal-particulars" tone="parchment" className="scroll-mt-24">
      <Container>
        <SectionHeading
          eyebrow="Journal information"
          title="Journal Particulars"
          description={`Preliminary details of ${JOURNAL.title}.`}
          action={
            <Link
              href={journalPath("/archive")}
              className="link-underline text-sm font-semibold text-primary"
            >
              Browse the archive →
            </Link>
          }
        />
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Journal particulars of {JOURNAL.title}</caption>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-rule last:border-b-0">
                  <th
                    scope="row"
                    className="w-2/5 bg-parchment/60 px-4 py-3 align-top font-semibold text-ink sm:w-1/3"
                  >
                    {row.label}
                  </th>
                  <td className="px-4 py-3 align-top leading-relaxed text-muted-foreground">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}

export default JournalParticulars;
