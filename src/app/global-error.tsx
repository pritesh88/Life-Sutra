"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#f7f3ea] px-4 font-sans text-[#1c1917]">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-2 text-sm text-[#57534e]">
            The application hit an unexpected error. You can try again or return home.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-md bg-[#8b4513] px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-[#d6d3d1] bg-white px-4 py-2 text-sm font-medium"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
