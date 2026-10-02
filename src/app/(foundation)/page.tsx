import {
  AboutSection,
  ApproachSection,
  AssessmentSection,
  CultureSection,
  Hero,
  KamdhenuSection,
  MissionSection,
  ParticularsSection,
  PublicationsSection,
  VisionSection,
} from "@/components/foundation/sections";
import { FOUNDATION } from "@/data/foundation";
import { foundationMeta } from "@/lib/foundation-meta";

export const metadata = foundationMeta({
  title: "Home",
  absoluteTitle: `${FOUNDATION.name} — Publishing Body`,
  description: `${FOUNDATION.publishingBody}: publisher of Life Sutra Synthesis, an interdisciplinary research journal, and Life Sutra, a book publication.`,
  path: "/",
});

export default function FoundationHomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <PublicationsSection />
      <ParticularsSection />
      <VisionSection />
      <MissionSection />
      <CultureSection />
      <ApproachSection />
      <KamdhenuSection />
      <AssessmentSection />
    </>
  );
}
