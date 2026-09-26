"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authRequest, useAuth } from "@/components/auth/AuthProvider";
import { safeNextPath } from "@/lib/auth/redirect";

type Mode = "login" | "register";

export const authInputClass =
  "mt-2 w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none";
export const authButtonClass =
  "inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60";

export function AuthForm({ mode, next }: { mode: Mode; next?: string | undefined }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string[]> | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const register = mode === "register";

  async function submit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    setFields(undefined);
    try {
      const payload = Object.fromEntries(formData.entries());
      await authRequest(`/api/auth/${mode}`, payload);
      await refresh();
      router.replace(safeNextPath(next));
      router.refresh();
    } catch (caught) {
      const authError = caught as Error & { fields?: Record<string, string[]> };
      setError(authError.message);
      setFields(authError.fields);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = authInputClass;
  return (
    <form action={submit} className="grid gap-5" noValidate>
      {register ? (
        <label className="block">
          <span className="text-sm font-semibold">Full name</span>
          <input
            className={inputClass}
            name="name"
            autoComplete="name"
            required
            aria-invalid={Boolean(fields?.["name"])}
          />
          {fields?.["name"]?.[0] ? (
            <span className="mt-1 block text-xs text-destructive">{fields["name"][0]}</span>
          ) : null}
        </label>
      ) : null}
      <label className="block">
        <span className="text-sm font-semibold">Email address</span>
        <input
          className={inputClass}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(fields?.["email"])}
        />
        {fields?.["email"]?.[0] ? (
          <span className="mt-1 block text-xs text-destructive">{fields["email"][0]}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Password</span>
        <input
          className={inputClass}
          name="password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          required
          aria-invalid={Boolean(fields?.["password"])}
        />
        {register ? (
          <span className="mt-1 block text-xs text-muted-foreground">
            At least 12 characters, including a letter and a number.
          </span>
        ) : null}
        {fields?.["password"]?.[0] ? (
          <span className="mt-1 block text-xs text-destructive">{fields["password"][0]}</span>
        ) : null}
      </label>
      {error ? (
        <p
          className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button className={authButtonClass} disabled={submitting} type="submit">
        {submitting ? "Please wait…" : register ? "Create account" : "Sign in"}
      </button>
      {!register ? (
        <p className="text-sm text-muted-foreground">
          <Link className="link-underline font-semibold text-primary" href="/auth/forgot-password">
            Forgot your password?
          </Link>
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {register ? "Already registered?" : "New to Life Sutra Synthesis?"}{" "}
        <Link
          className="link-underline font-semibold text-primary"
          href={register ? "/auth/login" : "/auth/register"}
        >
          {register ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
