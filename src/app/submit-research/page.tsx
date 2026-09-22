import {
  Action,
  ActionButton,
  Card,
  Container,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { domains } from "@/data/content";
import { submitContent, submitMeta } from "@/data/pages";

export const metadata = submitMeta;

function Field({
  label,
  hint,
  as = "input",
}: {
  label: string;
  hint?: string;
  as?: "input" | "textarea" | "select";
}) {
  const base =
    "mt-2 w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {as === "textarea" ? (
        <textarea rows={5} className={base} placeholder={hint} />
      ) : as === "select" ? (
        <select className={base} defaultValue="">
          <option value="" disabled>
            Select a domain
          </option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      ) : (
        <input type="text" className={base} placeholder={hint} />
      )}
    </label>
  );
}

export default function SubmitPage() {
  return (
    <>
      <PageHero
        eyebrow="For authors"
        title="Submit Research"
        lede="Submissions are accepted year-round in every domain. Read the methodology framework first — most desk rejections are for an unclassified claim, not for weak scholarship."
        meta={["No submission fee for members", "Double-anonymous review", "Open abstract on acceptance"]}
      >
        <Action to="/methodology" variant="outline" size="sm">
          Methodology framework
        </Action>
      </PageHero>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionHeading eyebrow="Requirements" title="What a submission must include" />
            <ul className="grid gap-3">
              {submitContent.requirements.map((r) => (
                <li key={r} className="flex gap-3 border-b border-rule pb-3 text-sm leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-saffron"
                  />
                  {r}
                </li>
              ))}
            </ul>
            <div className="mt-10 grid gap-4">
              {submitContent.timeline.map((t) => (
                <Card key={t.step} as="div" className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base">{t.step}</h3>
                    <Tag tone="gold">{t.detail}</Tag>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border bg-parchment p-7 sm:p-8">
            <SectionHeading
              eyebrow="Step 1 of 3"
              title="Register your submission"
              description="This Phase 1 form is illustrative — the manuscript upload and review portal arrive with the submission system."
            />
            <form className="grid gap-5">
              <Field label="Corresponding author" hint="Full name with title" />
              <Field label="Institutional email" hint="name@university.edu" />
              <Field label="Affiliation" hint="Department, institution, city" />
              <Field label="Research domain" as="select" />
              <Field label="Working title" hint="Title of the submitted study" />
              <Field
                label="Abstract"
                as="textarea"
                hint="250 words. State the claim, its class and the evidence base."
              />
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <ActionButton variant="primary" type="button">
                  Continue
                </ActionButton>
                <p className="text-xs text-muted-foreground">
                  Form submission is disabled in this release.
                </p>
              </div>
            </form>
          </div>
        </Container>
      </Section>
    </>
  );
}
