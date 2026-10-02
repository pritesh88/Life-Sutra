import Link from "next/link";
import { Wrap } from "@/components/foundation/Wrap";
import { ContactDetails, FSection, Kicker, PageIntro } from "@/components/foundation/sections";
import { FOUNDATION } from "@/data/foundation";
import { JOURNAL } from "@/data/journal";
import { foundationMeta } from "@/lib/foundation-meta";
import { IMPRINT_BASE, JOURNAL_BASE } from "@/lib/routes";

export const metadata = foundationMeta({
  title: "Contact",
  description: `Contact ${FOUNDATION.name} — ${FOUNDATION.contact.person}, ${FOUNDATION.contact.designation}. ${FOUNDATION.contact.email} · ${FOUNDATION.contact.phone} · ${FOUNDATION.contact.locality}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageIntro
        kicker="Contact"
        title="Contact the Foundation"
        lede="For research collaborations, workshops, institutional partnerships, or questions about the foundation and its publications."
      />
      <FSection labelledBy="contact-routes">
        <Wrap className="grid gap-12 lg:grid-cols-12">
          <ContactDetails className="lg:col-span-6" />
          <div className="lg:col-span-5 lg:col-start-8">
            <Kicker>Publication enquiries</Kicker>
            <h2 id="contact-routes" className="mt-5 text-[1.8rem] leading-tight">
              Writing about a publication?
            </h2>
            <dl className="mt-8 border-t border-islf-stone">
              <div className="border-b border-islf-stone py-5">
                <dt className="font-islf-serif text-xl">
                  <Link href={JOURNAL_BASE} className="hover:underline">
                    Life Sutra Synthesis
                  </Link>
                </dt>
                <dd className="mt-1.5 text-sm text-islf-muted">
                  Submissions and editorial correspondence:{" "}
                  <a href={`mailto:${JOURNAL.email}`} className="text-islf-indigo hover:underline">
                    {JOURNAL.email}
                  </a>
                </dd>
              </div>
              <div className="border-b border-islf-stone py-5">
                <dt className="font-islf-serif text-xl">
                  <Link href={IMPRINT_BASE} className="hover:underline">
                    Life Sutra
                  </Link>
                </dt>
                <dd className="mt-1.5 text-sm text-islf-muted">
                  To Be Issued. Enquiries go to the foundation at{" "}
                  <a
                    href={`mailto:${FOUNDATION.contact.email}`}
                    className="text-islf-indigo hover:underline"
                  >
                    {FOUNDATION.contact.email}
                  </a>
                  .
                </dd>
              </div>
            </dl>
          </div>
        </Wrap>
      </FSection>
    </>
  );
}
