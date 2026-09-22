import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/PasswordForms";
import { Container, PageHero, Section } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return (
    <>
      <PageHero
        eyebrow="Member access"
        title="Choose a new password"
        lede="Set a new password for your Life Sutra account. All existing sessions will be signed out."
      />
      <Section>
        <Container className="max-w-xl">
          <div className="rounded-md border border-border bg-parchment p-7 sm:p-8">
            <ResetPasswordForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
