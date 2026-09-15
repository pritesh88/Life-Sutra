export default function Loading() {
  return (
    <div className="border-b border-border bg-parchment" aria-busy="true" aria-live="polite">
      <div className="jaali pointer-events-none absolute inset-0 opacity-20" aria-hidden="true" />
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <div className="h-3 w-28 animate-pulse rounded bg-rule/80" />
        <div className="mt-6 h-10 w-2/3 max-w-xl animate-pulse rounded bg-rule/70" />
        <div className="mt-5 h-4 w-full max-w-2xl animate-pulse rounded bg-rule/50" />
        <div className="mt-3 h-4 w-5/6 max-w-xl animate-pulse rounded bg-rule/40" />
      </div>
    </div>
  );
}
