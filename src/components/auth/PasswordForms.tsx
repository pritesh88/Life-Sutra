"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authButtonClass, authInputClass } from "@/components/auth/AuthForm";
import { authRequest } from "@/components/auth/AuthProvider";

type FormState = {
  error: string | null;
  notice: string | null;
  fields: Record<string, string[]> | undefined;
  submitting: boolean;
};

const initial: FormState = { error: null, notice: null, fields: undefined, submitting: false };

function useSubmit(
  run: (data: Record<string, string>) => Promise<string | void>,
  onDone?: () => void,
) {
  const [state, setState] = useState<FormState>(initial);
  async function submit(formData: FormData) {
    setState({ ...initial, submitting: true });
    try {
      const notice = await run(Object.fromEntries(formData.entries()) as Record<string, string>);
      setState({ ...initial, notice: notice ?? null });
      onDone?.();
    } catch (caught) {
      const failure = caught as Error & { fields?: Record<string, string[]> };
      setState({ ...initial, error: failure.message, fields: failure.fields });
    }
  }
  return { state, submit };
}

function Feedback({ state }: { state: FormState }) {
  return (
    <>
      {state.error ? (
        <p
          className="rounded-md border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.notice ? (
        <p
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
          role="status"
        >
          {state.notice}
        </p>
      ) : null}
    </>
  );
}

function PasswordField({
  label,
  name,
  autoComplete,
  state,
  hint,
}: {
  label: string;
  name: string;
  autoComplete: string;
  state: FormState;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        className={authInputClass}
        name={name}
        type="password"
        autoComplete={autoComplete}
        required
        aria-invalid={Boolean(state.fields?.[name])}
      />
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
      {state.fields?.[name]?.[0] ? (
        <span className="mt-1 block text-xs text-destructive">{state.fields[name][0]}</span>
      ) : null}
    </label>
  );
}

export function ForgotPasswordForm() {
  const { state, submit } = useSubmit(async (data) => {
    const response = await authRequest("/api/auth/password/forgot", { email: data["email"] });
    return (response as { message?: string }).message ?? "Check your email for a reset link.";
  });
  return (
    <form action={submit} className="grid gap-5" noValidate>
      <label className="block">
        <span className="text-sm font-semibold">Email address</span>
        <input className={authInputClass} name="email" type="email" autoComplete="email" required />
      </label>
      <Feedback state={state} />
      <button className={authButtonClass} disabled={state.submitting} type="submit">
        {state.submitting ? "Please wait…" : "Send reset link"}
      </button>
      <p className="text-sm text-muted-foreground">
        <Link className="link-underline font-semibold text-primary" href="/auth/login">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  // The token travels in the URL fragment, so it is never sent to the server in
  // a GET, never logged, and never leaked through Referer.
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token");
    setToken(value);
    if (value) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const { state, submit } = useSubmit(
    async (data) => {
      await authRequest("/api/auth/password/reset", { token, password: data["password"] });
      return "Your password has been changed. You can now sign in.";
    },
    () => setDone(true),
  );

  if (token === undefined) return null;
  if (token === null && !done) {
    return (
      <p className="text-sm text-muted-foreground">
        This reset link is missing or has already been used.{" "}
        <Link className="link-underline font-semibold text-primary" href="/auth/forgot-password">
          Request a new one
        </Link>
        .
      </p>
    );
  }
  return (
    <form action={submit} className="grid gap-5" noValidate>
      {done ? null : (
        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          state={state}
          hint="At least 12 characters, including a letter and a number."
        />
      )}
      <Feedback state={state} />
      {done ? (
        <Link className={authButtonClass} href="/auth/login">
          Sign in
        </Link>
      ) : (
        <button className={authButtonClass} disabled={state.submitting} type="submit">
          {state.submitting ? "Please wait…" : "Set new password"}
        </button>
      )}
    </form>
  );
}

export function ChangePasswordForm() {
  const { state, submit } = useSubmit(async (data) => {
    await authRequest("/api/auth/password/change", {
      currentPassword: data["currentPassword"],
      newPassword: data["newPassword"],
    });
    return "Password changed. Your other devices have been signed out.";
  });
  return (
    <form action={submit} className="grid gap-4" noValidate>
      <PasswordField
        label="Current password"
        name="currentPassword"
        autoComplete="current-password"
        state={state}
      />
      <PasswordField
        label="New password"
        name="newPassword"
        autoComplete="new-password"
        state={state}
        hint="At least 12 characters, including a letter and a number."
      />
      <Feedback state={state} />
      <button className={authButtonClass} disabled={state.submitting} type="submit">
        {state.submitting ? "Please wait…" : "Change password"}
      </button>
    </form>
  );
}

export function SignOutOthersButton() {
  const { state, submit } = useSubmit(async () => {
    const { revoked } = (await authRequest("/api/auth/sessions/revoke-others")) as {
      revoked?: number;
    };
    return revoked ? `Signed out of ${revoked} other session(s).` : "No other active sessions.";
  });
  return (
    <form action={submit} className="grid gap-3">
      <Feedback state={state} />
      <button
        className="inline-flex h-10 w-fit items-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-muted"
        disabled={state.submitting}
        type="submit"
      >
        Sign out of other devices
      </button>
    </form>
  );
}
