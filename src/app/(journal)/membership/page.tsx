import { journalPath } from "@/lib/routes";
import { Check } from "lucide-react";
import {
  Action,
  ActionButton,
  Card,
  Container,
  PageHero,
  Section,
  SectionHeading,
  Tag,
} from "@/components/site/primitives";
import { membershipTiers } from "@/data/content";
import { membershipFaqs, membershipMeta } from "@/data/pages";
import { cn } from "@/lib/utils";

export const metadata = membershipMeta;

export default function MembershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Research community"
        title="Membership"
        lede="Membership funds open abstracts, review honoraria and the shared infrastructure. Abstracts and white papers stay free for everyone, always."
        meta={["Cancel any time"]}
      />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Tiers"
            title="Choose the level that fits your work"
            align="center"
          />
          <ul className="grid gap-6 lg:grid-cols-3">
            {membershipTiers.map((t) => (
              <Card
                key={t.id}
                as="li"
                className={cn("p-7", t.featured && "border-primary/50 bg-parchment shadow-raised")}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl">{t.name}</h3>
                  {t.featured ? <Tag tone="saffron">Most chosen</Tag> : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.audience}</p>
                <p className="mt-6 font-display text-3xl text-ink">
                  {t.price}
                  {t.cadence ? (
                    <span className="ml-2 font-sans text-xs tracking-wide text-muted-foreground">
                      {t.cadence}
                    </span>
                  ) : null}
                </p>
                <ul className="mt-6 grid gap-3 border-t border-rule pt-6">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed">
                      <Check className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <ActionButton
                    variant={t.featured ? "primary" : "outline"}
                    className="w-full"
                    type="button"
                  >
                    {t.price === "Free" ? "Create an account" : `Join as ${t.name}`}
                  </ActionButton>
                </div>
              </Card>
            ))}
          </ul>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Payment processing arrives in a later phase; these actions are illustrative.
          </p>
        </Container>
      </Section>

      <Section tone="parchment">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading eyebrow="Questions" title="Membership and review" />
          <ul className="grid gap-5">
            {membershipFaqs.map((f) => (
              <li key={f.q} className="border-b border-rule pb-5">
                <h3 className="text-base">{f.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </li>
            ))}
            <li className="flex flex-wrap gap-3 pt-2">
              <Action to="/submit-research" variant="primary" size="sm">
                Submit Research
              </Action>
              <Action to={journalPath("/institutions")} variant="outline" size="sm">
                Institutional partners
              </Action>
            </li>
          </ul>
        </Container>
      </Section>
    </>
  );
}
