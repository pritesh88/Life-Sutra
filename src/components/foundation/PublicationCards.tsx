import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FOUNDATION, publications } from "@/data/foundation";
import { JOURNAL, issueNumberLabel, issuePeriodLabel, journalIssues } from "@/data/journal";
import { ASSETS } from "@/lib/site";
import { cn } from "@/lib/utils";

const journal = publications.find((p) => p.slug === "life-sutra-synthesis")!;
const imprint = publications.find((p) => p.slug === "life-sutra")!;

/*
 * The journal cover previews Life Sutra Synthesis in its own palette and type
 * (Spectral, Karla, parchment, earth). Values mirror the journal's :root
 * tokens; they are written inline so nothing here touches the journal itself.
 */
const J = {
  parchment: "oklch(0.955 0.019 84)",
  earth: "oklch(0.335 0.035 55)",
  ink: "oklch(0.215 0.015 58)",
  muted: "oklch(0.47 0.021 62)",
};

/** Life Sutra Synthesis drawn as a journal issue. */
export function JournalCover({ className }: { className?: string | undefined }) {
  const current = journalIssues[0];
  return (
    <div
      className={cn(
        "@container relative aspect-[3/4] w-full shadow-[0_28px_50px_-30px_rgb(41_45_43/0.55)]",
        className,
      )}
      style={{ backgroundColor: J.parchment, ["--earth" as string]: J.earth }}
      aria-hidden="true"
    >
      <div className="jaali absolute inset-0 opacity-35" />
      <div className="relative flex h-full flex-col p-[9%]" style={{ color: J.ink }}>
        <div
          className="flex items-center justify-between gap-2 border-b pb-[5%] text-[0.5rem] tracking-[0.1em] uppercase"
          style={{ borderColor: J.earth, fontFamily: "var(--font-karla)" }}
        >
          <span className="font-bold whitespace-nowrap">Research Journal</span>
          <span className="whitespace-nowrap @max-[13rem]:hidden">
            {current ? issueNumberLabel(current) : ""}
          </span>
        </div>
        <Image src={ASSETS.emblem} alt="" width={64} height={64} className="mt-[12%] size-[22%]" />
        <p
          className="mt-auto text-[1.65rem] leading-[1.02]"
          style={{ fontFamily: "var(--font-spectral)", fontWeight: 500 }}
        >
          Life Sutra
          <br />
          Synthesis
        </p>
        <p
          className="mt-2 text-[0.62rem] leading-snug italic @max-[13rem]:hidden"
          style={{ fontFamily: "var(--font-spectral)", color: J.muted }}
        >
          {JOURNAL.subtitle}
        </p>
        <div
          className="mt-[7%] flex items-center justify-between border-t pt-[4%] text-[0.5rem] tracking-[0.1em] uppercase"
          style={{ borderColor: J.earth, fontFamily: "var(--font-karla)" }}
        >
          <span className="whitespace-nowrap">{current ? issuePeriodLabel(current) : ""}</span>
          <span className="@max-[13rem]:hidden">ISLF</span>
        </div>
      </div>
    </div>
  );
}

/** Gold-foil fill for lettering and ornament on the book cover. */
const FOIL =
  "bg-gradient-to-b from-[#f6e2ad] via-[#d9ae62] to-[#a87631] bg-clip-text text-transparent";

/** Cloth weave + sheen + board colour, as one background so nothing overrides it. */
const BOARDS = {
  burgundy:
    "repeating-linear-gradient(45deg, rgb(255 255 255 / 0.04) 0 1px, transparent 1px 4px), repeating-linear-gradient(-45deg, rgb(0 0 0 / 0.06) 0 1px, transparent 1px 4px), " +
    "radial-gradient(120% 80% at 18% 12%, rgb(255 255 255 / 0.16), transparent 45%), linear-gradient(150deg, #6e3270 0%, #4f2259 48%, #321640 100%)",
  olive:
    "repeating-linear-gradient(45deg, rgb(255 255 255 / 0.04) 0 1px, transparent 1px 4px), repeating-linear-gradient(-45deg, rgb(0 0 0 / 0.06) 0 1px, transparent 1px 4px), " +
    "radial-gradient(120% 80% at 18% 12%, rgb(255 255 255 / 0.14), transparent 45%), linear-gradient(150deg, #8d8e70 0%, #6c6d52 50%, #4c4d38 100%)",
};

/** The sutra — a single gold thread looping through three rings around a centre. */
function SutraOrnament({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-auto w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e2ad" />
          <stop offset="0.5" stopColor="#d9ae62" />
          <stop offset="1" stopColor="#a87631" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`}>
        <circle cx="50" cy="50" r="46" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="42" strokeWidth="0.5" strokeDasharray="1 2.4" />
        <circle cx="50" cy="38" r="17" strokeWidth="1.3" />
        <circle cx="39.6" cy="56" r="17" strokeWidth="1.3" />
        <circle cx="60.4" cy="56" r="17" strokeWidth="1.3" />
        <path d="M50 4 V21 M50 79 V96" strokeWidth="1" />
      </g>
      <circle cx="50" cy="50" r="3.2" fill={`url(#${id})`} />
      {[0, 90, 180, 270].map((deg) => (
        <rect
          key={deg}
          x="48.4"
          y="2.4"
          width="3.2"
          height="3.2"
          transform={`rotate(${deg} 50 50) rotate(45 50 4)`}
          fill={`url(#${id})`}
        />
      ))}
    </svg>
  );
}

/** Plum issue cover: soft sheen over the plum gradient, matt like printed card. */
const ISSUE_PLUM =
  "radial-gradient(110% 70% at 20% 10%, rgb(255 255 255 / 0.14), transparent 50%), linear-gradient(150deg, #6e3270 0%, #4f2259 50%, #321640 100%)";
const GOLD = "#d9ae62";

/**
 * Life Sutra drawn as a journal issue — the same layout as the Life Sutra
 * Synthesis cover (header rule, mark, title, footer rule), in Life Sutra's
 * own plum and gold with the sutra ornament.
 */
export function LifeSutraCover({ className }: { className?: string | undefined }) {
  return (
    <div
      className={cn(
        "@container relative aspect-[3/4] w-full shadow-[0_28px_50px_-30px_rgb(30_12_40/0.7)]",
        className,
      )}
      style={{ backgroundImage: ISSUE_PLUM }}
      aria-hidden="true"
    >
      <div className="absolute inset-[4%] border" style={{ borderColor: `${GOLD}40` }} />
      <div className="relative flex h-full flex-col p-[9%] text-[#f3e3c3]">
        <div
          className="flex items-center justify-between gap-2 border-b pb-[5%] text-[0.5rem] tracking-[0.1em] uppercase"
          style={{ borderColor: GOLD, fontFamily: "var(--font-public-sans)" }}
        >
          <span className="font-bold whitespace-nowrap">Journal</span>
          <span className="whitespace-nowrap @max-[13rem]:hidden">First Issue</span>
        </div>
        <div className="mt-[12%] w-[26%]">
          <SutraOrnament id="foil-issue-cover" />
        </div>
        <p className={cn("mt-auto font-imprint-display text-[1.9rem] leading-[0.98] italic", FOIL)}>
          Life
          <br />
          Sutra
        </p>
        <p className="mt-2 font-imprint-display text-[0.7rem] leading-snug text-[#e6cfa4]/85 italic @max-[13rem]:hidden">
          A journal of {FOUNDATION.name}
        </p>
        <div
          className="mt-[7%] flex items-center justify-between border-t pt-[4%] text-[0.5rem] tracking-[0.1em] uppercase"
          style={{ borderColor: GOLD, fontFamily: "var(--font-public-sans)" }}
        >
          <span className="whitespace-nowrap">Diwali · November 2026</span>
          <span className="@max-[13rem]:hidden">ISLF</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Life Sutra drawn as a cloth-bound book: plum board with sheen, raised
 * spine bands, a gold-foil frame and the sutra ornament. No invented title —
 * the cover carries only the publication's own name.
 */
export function BookCover({
  className,
  tone = "burgundy",
  label = "Life Sutra",
}: {
  className?: string | undefined;
  tone?: "burgundy" | "olive";
  label?: string;
}) {
  const [first, ...rest] = label.split(" ");
  const gradientId = `foil-${tone}-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div className={cn("@container relative aspect-[2/3] w-full", className)} aria-hidden="true">
      {/* page block */}
      <div className="absolute inset-y-[2.5%] right-[-3.5%] left-[8%] bg-[#fbf6ec] shadow-[inset_0_0_0_1px_rgb(57_47_43/0.1)]">
        <div className="imprint-laid absolute inset-0" />
      </div>

      {/* cloth board */}
      <div
        className="absolute inset-0 overflow-hidden shadow-[0_34px_50px_-26px_rgb(30_12_40/0.75),inset_0_0_0_1px_rgb(255_255_255/0.06)]"
        style={{ backgroundImage: BOARDS[tone] }}
      >
        {/* spine with raised bands */}
        <span className="absolute inset-y-0 left-0 w-[9%] bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
        <span className="absolute inset-y-0 left-[9%] w-px bg-white/15" />
        {["top-[12%]", "top-[24%]", "bottom-[24%]", "bottom-[12%]"].map((pos) => (
          <span
            key={pos}
            className={cn(
              "absolute left-0 h-[1.6%] w-[9%] bg-gradient-to-b from-[#e7c47f] to-[#a87631] opacity-80",
              pos,
            )}
          />
        ))}

        {/* gold-foil frame */}
        <div className="absolute inset-y-[5.5%] right-[7%] left-[15%] border border-[#d9ae62]/70">
          <div className="absolute inset-[3%] border border-[#d9ae62]/35" />
          {[
            "-top-[3px] -left-[3px]",
            "-top-[3px] -right-[3px]",
            "-bottom-[3px] -left-[3px]",
            "-bottom-[3px] -right-[3px]",
          ].map((pos) => (
            <span key={pos} className={cn("absolute size-[6px] rotate-45 bg-[#d9ae62]", pos)} />
          ))}

          <div className="relative flex h-full flex-col items-center px-[10%] py-[12%] text-center">
            <span
              className={cn("font-imprint-display text-[0.6rem] tracking-[0.34em] uppercase", FOIL)}
            >
              ISLF
            </span>
            <div className="mt-[14%] w-[62%] @max-[9rem]:w-[54%]">
              <SutraOrnament id={gradientId} />
            </div>
            <span
              className={cn(
                "mt-auto font-imprint-display text-[1.9rem] leading-[0.95] italic @max-[9rem]:text-[1.35rem]",
                FOIL,
              )}
            >
              {first}
              {rest.length ? (
                <>
                  <br />
                  {rest.join(" ")}
                </>
              ) : null}
            </span>
            <span className="mt-[8%] block h-px w-[30%] bg-gradient-to-r from-transparent via-[#d9ae62] to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The two publications presented as objects on one shelf: same structure,
 * different material — each an issue in its own colours: parchment for
 * Life Sutra Synthesis, plum and gold for Life Sutra. Both sit side by side
 * on the same baseline.
 */
export function PublicationShelf({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const current = journalIssues[0];

  const items = [
    {
      pub: journal,
      object: <JournalCover className="max-w-[15rem]" />,
      // The journal's own earth brown as a display case, so its parchment cover stands out.
      stage: "bg-[radial-gradient(75%_65%_at_50%_30%,oklch(0.47_0.05_60),oklch(0.3_0.035_55)_75%)]",
      frame: "border-[oklch(0.76_0.085_84)]/30",
      details: [
        ["Designation", journal.designation],
        ["Status", journal.status],
        [
          "Current issue",
          current ? `${issueNumberLabel(current)} · ${issuePeriodLabel(current)}` : "—",
        ],
        ["ISSN", JOURNAL.issn],
      ],
      cta: "bg-[oklch(0.335_0.035_55)] text-[oklch(0.965_0.015_85)] hover:bg-[oklch(0.28_0.03_55)]",
      titleClass: "",
      titleStyle: { fontFamily: "var(--font-spectral)", fontWeight: 400 },
    },
    {
      pub: imprint,
      object: <LifeSutraCover className="max-w-[15rem]" />,
      // Soft lavender ground that lets the plum binding and gold foil glow.
      stage: "bg-[radial-gradient(75%_65%_at_50%_30%,#fbf8fd,#e7def0_75%)]",
      frame: "border-[#5a2a63]/20",
      details: [
        ["Designation", imprint.designation],
        ["Status", imprint.status],
      ],
      cta: "bg-[#5a2a63] text-imprint-paper hover:bg-[#45204e]",
      titleClass: "font-imprint-display italic",
      titleStyle: undefined,
    },
  ];

  return (
    <div className="grid gap-16 md:grid-cols-2 md:gap-8 lg:gap-14">
      {items.map(({ pub, object, stage, frame, details, cta, titleClass, titleStyle }) => (
        <article key={pub.slug} className="group flex flex-col">
          <Link href={pub.href} className="block" tabIndex={-1} aria-hidden="true">
            <div
              className={cn(
                "relative flex h-[21rem] items-end justify-center overflow-hidden px-10 pt-10 sm:h-[25rem]",
                stage,
              )}
            >
              <span
                className={cn("pointer-events-none absolute inset-4 border", frame)}
                aria-hidden="true"
              />
              <div className="relative w-full pb-10 transition-transform duration-500 ease-out group-hover:-translate-y-2 [&>*]:mx-auto">
                {object}
              </div>
            </div>
          </Link>
          <div className="flex flex-1 flex-col pt-8">
            <p className="islf-kicker text-[0.62rem] text-islf-magenta-text">{pub.category}</p>
            <Heading
              className={cn("mt-3 text-[2.3rem] leading-none sm:text-[2.7rem]", titleClass)}
              style={titleStyle}
            >
              <Link href={pub.href} className="decoration-1 underline-offset-8 hover:underline">
                {pub.title}
              </Link>
            </Heading>
            <p className="mt-5 max-w-lg text-[1rem] leading-relaxed text-islf-muted">
              {pub.description}
            </p>
            <dl className="mt-7 grid max-w-lg grid-cols-2 gap-x-6">
              {details.map(([label, value]) => (
                <div key={label} className="border-t border-islf-stone py-3">
                  <dt className="islf-kicker text-[0.58rem] text-islf-muted">{label}</dt>
                  <dd className="mt-1 text-[0.95rem]">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-8">
              <Link
                href={pub.href}
                className={cn(
                  "inline-flex h-11 items-center gap-2 px-5 text-sm font-semibold transition-colors",
                  cta,
                )}
              >
                {pub.cta}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <span className="text-xs text-islf-muted">
                Published by {FOUNDATION.publishingBody}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
