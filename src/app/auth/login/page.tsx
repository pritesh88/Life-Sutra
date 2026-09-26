import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { safeNextPath } from "@/lib/auth/redirect";
import { Container, PageHero, Section } from "@/components/site/primitives";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="Member access"
        title="Welcome back"
        lede="Sign in to access your Life Sutra Synthesis profile and future researcher workspace."
      />
      <Section>
        <Container className="max-w-xl">
          <div className="rounded-md border border-border bg-parchment p-7 sm:p-8">
            <AuthForm mode="login" next={safeNextPath(next)} />
          </div>
        </Container>
      </Section>
    </>
  );
}
