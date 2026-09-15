"use client";

import { Action, ActionButton } from "@/components/site/primitives";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn&apos;t load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <ActionButton variant="primary" size="sm" type="button" onClick={() => reset()}>
            Try again
          </ActionButton>
          <Action to="/" variant="outline" size="sm">
            Go home
          </Action>
        </div>
      </div>
    </div>
  );
}
