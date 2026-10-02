import { Card, Container, Eyebrow, Section, SectionHeading } from "@/components/site/primitives";
import {
  JOURNAL,
  JOURNAL_ABOUT,
  JOURNAL_AIMS,
  JOURNAL_GUIDELINES,
  JOURNAL_POLICIES,
  JOURNAL_SCOPE,
} from "@/data/journal";

/**
 * About the Journal, Aims & Scope, Author Guidelines, Submission and policies
 * on the journal's main page (ISSN India: "Opening/First page/Main page").
 */
export function JournalAbout() {
  return (
    <>
      <Section id="about-the-journal" className="scroll-mt-24">
        <Container className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              eyebrow="About the journal"
              title="Aims & Scope"
              description={JOURNAL_ABOUT}
            />
            <Eyebrow>Aims</Eyebrow>
            <ol className="mt-4 grid gap-3">
              {JOURNAL_AIMS.map((aim, i) => (
                <li
                  key={aim}
                  className="flex gap-3 text-[0.95rem] leading-relaxed text-muted-foreground"
                >
                  <span className="font-mono text-xs text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {aim}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-md border border-border bg-parchment p-7">
            <Eyebrow>Scope — subject areas</Eyebrow>
            <ul className="mt-4 flex flex-wrap gap-2">
              {JOURNAL_SCOPE.map((s) => (
                <li
                  key={s}
                  className="rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-ink"
                >
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Subject: {JOURNAL.subject}. Language: {JOURNAL.language}. Frequency:{" "}
              {JOURNAL.frequency}.
            </p>
          </div>
        </Container>
      </Section>

      <Section id="author-guidelines" tone="parchment" className="scroll-mt-24">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="For authors" title="Author Guidelines" />
            <ul className="grid gap-3">
              {JOURNAL_GUIDELINES.map((g) => (
                <li
                  key={g}
                  className="flex gap-3 text-[0.95rem] leading-relaxed text-muted-foreground"
                >
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                  {g}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-md border border-border bg-card p-6">
              <Eyebrow>Submission</Eyebrow>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                Send your manuscript and title page by email to{" "}
                <a
                  href={`mailto:${JOURNAL.email}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {JOURNAL.email}
                </a>
                . Submissions are accepted year-round. Full requirements and the review timeline are
                on the{" "}
                <a href="/submit-research" className="font-semibold text-primary hover:underline">
                  Submit Research
                </a>{" "}
                page.
              </p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Editorial policies" title="Review, Plagiarism & Ethics" />
            <ul className="grid gap-4">
              {JOURNAL_POLICIES.map((p) => (
                <Card key={p.title} as="li" className="p-5">
                  <h3 className="text-base leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </Card>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default JournalAbout;
