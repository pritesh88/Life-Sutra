import { BooksSection } from "@/components/foundation/BooksSection";
import { PageIntro } from "@/components/foundation/sections";
import { FOUNDATION } from "@/data/foundation";
import { foundationMeta } from "@/lib/foundation-meta";

export const metadata = foundationMeta({
  title: "Books",
  description: `Published and upcoming books by ${FOUNDATION.name} and its contributors.`,
  path: "/books",
});

export default function BooksPage() {
  return (
    <>
      <PageIntro
        kicker="Books"
        title="Our Books"
        lede="Books written and contributed to by I Smart Life Foundation — published titles first, then upcoming ones."
      />
      <BooksSection asPage />
    </>
  );
}
