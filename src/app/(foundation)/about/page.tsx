import {
  AboutSection,
  CultureSection,
  InitiativesSection,
  PageIntro,
  PublicationsSection,
} from "@/components/foundation/sections";
import { FOUNDATION } from "@/data/foundation";
import { foundationMeta } from "@/lib/foundation-meta";

export const metadata = foundationMeta({
  title: "About the Foundation",
  description: `${FOUNDATION.name} is a ${FOUNDATION.legalForm} founded on the Upanishadic Mahavakya ${FOUNDATION.mahavakya.transliteration}, integrating consciousness and mind synthesis into everyday life.`,
  path: "/about",
});

export default function FoundationAboutPage() {
  return (
    <>
      <PageIntro kicker="About" title="About the Foundation" lede={FOUNDATION.summary} />
      <AboutSection showLink={false} />
      <CultureSection />
      <InitiativesSection />
      <PublicationsSection />
    </>
  );
}
