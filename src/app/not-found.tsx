import Link from "next/link";
import { Action } from "@/components/site/primitives";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-primary">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Action to="/" variant="primary" size="sm">
            Go home
          </Action>
          <Link
            href="/research"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3.5 text-sm font-semibold"
          >
            Browse research
          </Link>
        </div>
      </div>
    </div>
  );
}
