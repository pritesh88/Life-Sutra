import { ComingSoon } from "@/components/site/ComingSoon";
import { Container, PageHero, Section } from "@/components/site/primitives";
import { dialogueMeta } from "@/data/pages";

export const metadata = dialogueMeta;

export default function DialoguePage() {
  return (
    <>
      <PageHero
        eyebrow="Discussion forum"
        title="IKS Dialogue"
        lede="A moderated space for argument, where contributors respond to published work, contest method and set out positions. This section is being prepared by the editorial team."
        meta={["In preparation"]}
      />

      <Section>
        <Container>
          <ComingSoon
            title="Dialogue is opening soon"
            purpose={[
              "Commentary, roundtables, responses and interviews will be published here as they are commissioned.",
              "Every entry will be signed and attributed; responses will be published alongside the piece they answer.",
              "Contributions will be editorially moderated before publication.",
            ]}
          />
        </Container>
      </Section>
    </>
  );
}
