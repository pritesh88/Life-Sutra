import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { type Book, publishedBooks, upcomingBooks } from "@/data/books";
import { FHeading, FSection } from "./sections";
import { TriadMark } from "./TriadDiagram";
import { Wrap } from "./Wrap";

/** Typeset stand-in for a book whose cover has not been released yet. */
function PendingCover({ book }: { book: Book }) {
  return (
    <div
      className="islf-aurora relative flex aspect-[2/3] w-full flex-col justify-between p-[10%] text-islf-ivory"
      aria-hidden="true"
    >
      <span className="islf-spectrum absolute inset-x-0 top-0 h-1" />
      <TriadMark className="size-7 text-islf-ivory/80" />
      <div>
        <p className="font-islf-serif text-[1.35rem] leading-tight">{book.title}</p>
        <p className="islf-kicker mt-3 text-[0.5rem] text-islf-glow">Cover coming</p>
      </div>
    </div>
  );
}

function BookCard({ book, upcoming }: { book: Book; upcoming?: boolean }) {
  const meta = [
    book.publisher,
    book.published,
    book.pages ? `${book.pages} pages` : undefined,
    book.language,
    book.formats?.join(" · "),
  ].filter(Boolean);

  const cover = book.cover ? (
    <Image
      src={book.cover.src}
      alt={`Cover of ${book.title}`}
      width={book.cover.width}
      height={book.cover.height}
      sizes="(max-width: 640px) 40vw, 180px"
      className="h-auto w-full shadow-[0_24px_40px_-24px_rgb(35_27_58/0.6)] transition-transform duration-500 group-hover:-translate-y-1.5"
    />
  ) : (
    <PendingCover book={book} />
  );

  return (
    <li
      id={book.slug}
      className="group grid scroll-mt-28 grid-cols-[7.5rem_1fr] gap-5 border-t border-islf-stone pt-7 sm:grid-cols-[10rem_1fr] sm:gap-7"
    >
      <div>
        {book.link ? (
          <a href={book.link.href} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
            {cover}
          </a>
        ) : (
          cover
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          {upcoming ? (
            <span className="islf-kicker bg-islf-magenta-text px-2 py-1 text-[0.52rem] text-islf-paper">
              Upcoming
            </span>
          ) : null}
          {book.contribution ? (
            <span className="islf-kicker border border-islf-indigo/30 px-2 py-1 text-[0.52rem] text-islf-indigo">
              Contributed chapter
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-[1.45rem] leading-tight">{book.title}</h3>
        {book.subtitle ? (
          <p className="mt-1 font-islf-serif text-[1rem] leading-snug text-islf-muted italic">
            {book.subtitle}
          </p>
        ) : null}
        <p className="mt-3 text-sm">
          {book.credits.map((c, i) => (
            <span key={c.role}>
              {i > 0 ? <span className="text-islf-muted"> · </span> : null}
              <span className="text-islf-muted">{c.role}: </span>
              {c.names.join(", ")}
            </span>
          ))}
        </p>
        {book.contribution ? (
          <p className="mt-2 text-sm text-islf-indigo">{book.contribution}</p>
        ) : null}
        {book.description ? (
          <p className="mt-3 text-[0.92rem] leading-relaxed text-islf-muted">{book.description}</p>
        ) : null}
        {meta.length ? <p className="mt-3 text-xs text-islf-muted">{meta.join("  ·  ")}</p> : null}
        {book.isbn?.length ? (
          <ul className="mt-1.5 font-mono text-xs text-islf-ink/80">
            {book.isbn.map((i) => (
              <li key={i.value}>
                {i.label} {i.value}
              </li>
            ))}
          </ul>
        ) : null}
        {book.link ? (
          <a
            href={book.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-10 items-center gap-2 bg-islf-indigo px-4 text-sm font-semibold text-islf-paper transition-colors hover:bg-islf-indigo-deep"
          >
            {book.link.label}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </li>
  );
}

export function BooksSection({ asPage = false }: { asPage?: boolean }) {
  return (
    <FSection
      id="books"
      tone="mist"
      labelledBy={asPage ? undefined : "books-title"}
      className={asPage ? "pt-16 sm:pt-20" : undefined}
    >
      <Wrap>
        {asPage ? null : (
          <div className="mb-14">
            <FHeading
              id="books-title"
              kicker="Books"
              title="Our Books"
              lede="Books written and contributed to by I Smart Life Foundation."
            />
          </div>
        )}

        <h3 className="islf-kicker text-[0.62rem] text-islf-magenta-text">Published</h3>
        <ul className="mt-5 grid gap-x-12 gap-y-10 lg:grid-cols-2">
          {publishedBooks.map((b) => (
            <BookCard key={b.slug} book={b} />
          ))}
        </ul>

        {upcomingBooks.length ? (
          <>
            <h3 className="islf-kicker mt-16 text-[0.62rem] text-islf-magenta-text">Upcoming</h3>
            <ul className="mt-5 grid gap-x-12 gap-y-10 lg:grid-cols-2">
              {upcomingBooks.map((b) => (
                <BookCard key={b.slug} book={b} upcoming />
              ))}
            </ul>
          </>
        ) : null}
      </Wrap>
    </FSection>
  );
}
