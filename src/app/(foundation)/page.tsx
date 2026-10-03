import { BooksSection } from "@/components/foundation/BooksSection";
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
  description: `${FOUNDATION.publishingBody}: publisher of two journals — Life Sutra Synthesis, an interdisciplinary research journal, and Life Sutra.`,
  path: "/",
});

export default function FoundationHomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <AssessmentSection />
      <PublicationsSection />
      <ParticularsSection />
      <BooksSection />
      <VisionSection />
      <MissionSection />
      <CultureSection />
      <ApproachSection />
      <KamdhenuSection />
    </>
  );
}
