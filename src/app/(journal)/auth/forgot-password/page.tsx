import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/PasswordForms";
import { Container, PageHero, Section } from "@/components/site/primitives";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHero
        eyebrow="Member access"
        title="Reset your password"
        lede="Enter your account email and we will send you a link to choose a new password."
      />
      <Section>
        <Container className="max-w-xl">
          <div className="rounded-md border border-border bg-parchment p-7 sm:p-8">
            <ForgotPasswordForm />
          </div>
        </Container>
      </Section>
    </>
  );
}
