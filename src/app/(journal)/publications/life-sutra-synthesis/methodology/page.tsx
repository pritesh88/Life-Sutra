import {
  Card,
  Container,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { editorialPrinciples } from "@/data/content";
import { methodologyMeta } from "@/data/pages";

export const metadata = methodologyMeta;

export default function MethodologyPage() {
  return (
    <>
      <PageHero
        eyebrow="Standards"
        title="Methodology"
        lede="Life Sutra Synthesis does not propose a single universal methodology. It works with a plural, pramāṇa-sensitive approach: method should respond to the nature of the knowledge claim. The full stage-by-stage protocol document is in preparation; the principles below already govern every editorial decision."
        meta={["In preparation"]}
      />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Editorial standards"
            title="Four principles that govern every decision"
            description="These principles are in effect today and will anchor the full methodology protocol once it is published."
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {editorialPrinciples.map((p) => (
              <Card key={p.title} as="li" className="p-6">
                <Tag tone="gold">{p.title}</Tag>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
