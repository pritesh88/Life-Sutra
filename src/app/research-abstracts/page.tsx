import {
  Container,
  MetaRow,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { abstracts } from "@/data/content";
import { abstractsMeta } from "@/data/pages";

export const metadata = abstractsMeta;

export default function AbstractsPage() {
  return (
    <>
      <PageHero
        eyebrow="Open index"
        title="Research Abstracts"
        lede="Abstracts are published as soon as a submission clears desk review, so the field can see work in progress rather than waiting for the issue."
        meta={[`${abstracts.length} records`, "Updated weekly", "Citable on acceptance"]}
      />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Most recent"
            title="Indexed abstracts"
            description="Status reflects position in the review pipeline, not editorial endorsement."
          />
          <ul className="divide-y divide-rule border-y border-rule">
            {abstracts.map((a) => (
              <li key={a.id} className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="max-w-3xl">
                  <MetaRow items={[a.id, a.domain, a.date]} />
                  <h3 className="mt-2 text-lg leading-snug">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.summary}</p>
                  <p className="mt-3 text-sm font-semibold">{a.authors.join(" · ")}</p>
                </div>
                <Tag
                  tone={
                    a.status === "Published" ? "leaf" : a.status === "Accepted" ? "gold" : "default"
                  }
                >
                  {a.status}
                </Tag>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
