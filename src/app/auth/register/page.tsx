import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container, PageHero, Section } from "@/components/site/primitives";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <>
      <PageHero
        eyebrow="Member access"
        title="Create your Life Sutra Synthesis account"
        lede="Start with a secure researcher profile. Journal and administrative access is assigned by an administrator."
      />
      <Section>
        <Container className="max-w-xl">
          <div className="rounded-md border border-border bg-parchment p-7 sm:p-8">
            <AuthForm mode="register" />
          </div>
        </Container>
      </Section>
    </>
  );
}
