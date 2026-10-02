import { MissionSection, PageIntro, VisionSection } from "@/components/foundation/sections";
import { FOUNDATION } from "@/data/foundation";
import { foundationMeta } from "@/lib/foundation-meta";

export const metadata = foundationMeta({
  title: "Vision & Mission",
  description: `The vision and mission of ${FOUNDATION.name}: research on spirituality and science, consciousness, sustainable development, conscious leadership and human well-being.`,
  path: "/vision-mission",
});

export default function VisionMissionPage() {
  return (
    <>
      <PageIntro
        kicker="Vision & Mission"
        title="Vision & Mission"
        lede="What the foundation aspires to, and the areas of work through which it pursues those aspirations."
      />
      <VisionSection />
      <MissionSection />
    </>
  );
}
