import Link from "next/link";
import { Wrap } from "@/components/foundation/Wrap";
import { FSection, Kicker, PageIntro, PublicationsSection } from "@/components/foundation/sections";
import { FOUNDATION, foundationAddress, publications } from "@/data/foundation";
import { foundationMeta } from "@/lib/foundation-meta";

export const metadata = foundationMeta({
  title: "Publications",
  description: `Publications issued by ${FOUNDATION.publishingBody}: two journals — Life Sutra Synthesis, an interdisciplinary research journal, and Life Sutra.`,
  path: "/publications",
});

export default function PublicationsPage() {
  const { contact } = FOUNDATION;
  return (
    <>
      <PageIntro
        kicker="Publications"
        title="Explore Our Publications"
        lede="Discover research and knowledge publications issued by I Smart Life Foundation. Each publication has its own editorial identity, bibliographic record and pages."
      />
      <PublicationsSection asPage />

      <FSection labelledBy="publisher-title">
        <Wrap className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Kicker>Publisher</Kicker>
            <h2 id="publisher-title" className="mt-5 text-[2rem] leading-tight sm:text-[2.5rem]">
              One publisher, two publications
            </h2>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-islf-muted">
              {FOUNDATION.name} is the publishing body for both titles. They are separate
              publications — not separate publishers — and each keeps its own publication details.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <table className="w-full border-collapse border-t border-islf-stone text-left text-[0.95rem]">
              <caption className="sr-only">Publisher details</caption>
              <tbody>
                {[
                  ["Publishing body", FOUNDATION.publishingBody],
                  ["Type of publisher", `Institutional publisher (${FOUNDATION.legalForm})`],
                  [
                    "Address",
                    `${foundationAddress()}${contact.registeredAddress ? "" : " — full registered address to be confirmed"}`,
                  ],
                  ["Email", contact.email],
                  ["Phone", contact.phone],
                  ["Website", FOUNDATION.website],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-islf-stone">
                    <th
                      scope="row"
                      className="w-2/5 py-3.5 pr-4 align-top text-xs font-semibold tracking-wide text-islf-muted uppercase"
                    >
                      {label}
                    </th>
                    <td className="py-3.5 align-top">{value}</td>
                  </tr>
                ))}
                {publications.map((p) => (
                  <tr key={p.slug} className="border-b border-islf-stone">
                    <th
                      scope="row"
                      className="py-3.5 pr-4 align-top text-xs font-semibold tracking-wide text-islf-muted uppercase"
                    >
                      {p.designation}
                    </th>
                    <td className="py-3.5 align-top">
                      <Link href={p.href} className="text-islf-indigo hover:underline">
                        {p.title}
                      </Link>{" "}
                      <span className="text-islf-muted">· {p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Wrap>
      </FSection>
    </>
  );
}
