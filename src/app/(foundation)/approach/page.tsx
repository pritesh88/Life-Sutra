import {
  ApproachSection,
  AssessmentSection,
  KamdhenuSection,
  PageIntro,
} from "@/components/foundation/sections";
import { FOUNDATION } from "@/data/foundation";
import { foundationMeta } from "@/lib/foundation-meta";

export const metadata = foundationMeta({
  title: "Our Approach",
  description: `${FOUNDATION.name}'s three interconnected pillars: Work (Green Habitat), Life (Coaching and Counseling) and Consciousness (Self, Mind and Awareness).`,
  path: "/approach",
});

export default function ApproachPage() {
  return (
    <>
      <PageIntro
        kicker="Our Approach"
        title="Work, Life and Consciousness"
        lede={`${FOUNDATION.tagline.replace(/\.$/, "")} — three pillars that together describe how the foundation works with people, organisations and environments.`}
      />
      <ApproachSection showLink={false} />
      <KamdhenuSection />
      <AssessmentSection />
    </>
  );
}
