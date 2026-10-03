"use client";

import { useEffect, useRef, useState } from "react";

/*
 * 5P Harmony + Agency Assessment. Item bank, scoring, Agency weighting and CP
 * rules follow the foundation's own assessment tool; only presentation and
 * accessibility differ. Everything runs and is stored in the visitor's browser.
 */

const DIMENSIONS = [
  { key: "people", label: "People", hint: "Care & belonging", color: "#b76e52" },
  { key: "planet", label: "Planet", hint: "Mindful living", color: "#6f8a62" },
  { key: "prosperity", label: "Prosperity", hint: "Security & needs", color: "#b08a45" },
  { key: "peace", label: "Peace", hint: "Inner calm", color: "#6e8296" },
  { key: "partnership", label: "Partnership", hint: "Shared purpose", color: "#8e6a80" },
] as const;

type Dimension = (typeof DIMENSIONS)[number];
type DimKey = Dimension["key"];
type PerDim = Record<DimKey, number>;

/** Direct and reverse-worded statements; each session draws five per dimension. */
const ITEM_BANK: Record<DimKey, { normal: string[]; reverse: string[] }> = {
  people: {
    normal: [
      "I feel genuinely cared for by the people close to me.",
      "I make time to support others without expecting something in return.",
      "My relationships at home or work feel respectful and balanced.",
      "I actively listen when someone shares a problem with me.",
      "I feel comfortable asking for help when I need it.",
    ],
    reverse: [
      "I often feel isolated even when I'm around people I know.",
      "I find it hard to trust the people close to me.",
      "I tend to withdraw rather than reach out when I'm struggling.",
    ],
  },
  planet: {
    normal: [
      "I am conscious of how my daily choices affect the environment.",
      "I actively reduce waste where I can.",
      "I have taken at least one concrete environmental action recently.",
      "I feel a sense of responsibility toward nature, not just awareness of it.",
      "I encourage people around me to make more sustainable choices.",
    ],
    reverse: [
      "I rarely think about the environmental impact of my choices.",
      "Sustainability feels like someone else's responsibility, not mine.",
      "I don't feel any real connection to the natural world.",
    ],
  },
  prosperity: {
    normal: [
      "I feel financially secure enough to meet my basic needs without constant stress.",
      "I am growing in skills or capability that improve my future prospects.",
      "I use my time, money, and skill in ways aligned with my values.",
      "I feel my work or effort is fairly recognized.",
      "I have a clear sense of what “enough” looks like for me.",
    ],
    reverse: [
      "I frequently worry about money even when things are objectively fine.",
      "I feel stuck, without a clear path to growth.",
      "I chase more without a real sense of why.",
    ],
  },
  peace: {
    normal: [
      "I generally feel calm rather than reactive in daily situations.",
      "I have a regular practice that settles my mind.",
      "I recover from stress or conflict without carrying it for long.",
      "I feel at ease with who I am, including my flaws.",
      "My sleep and rest generally leave me feeling restored.",
    ],
    reverse: [
      "Small frustrations often stay with me for the rest of the day.",
      "My mind feels crowded or restless more often than not.",
      "I find it hard to switch off, even when I have the chance to rest.",
    ],
  },
  partnership: {
    normal: [
      "I actively collaborate with others toward shared goals.",
      "I trust the people I regularly work or engage with.",
      "I contribute to causes or communities larger than my immediate circle.",
      "I am open to being influenced or changed by working with others.",
      "I follow through on commitments I make to others.",
    ],
    reverse: [
      "I prefer working alone even when collaboration would help.",
      "I find it difficult to rely on others to follow through.",
      "I hold back from fully committing to group efforts.",
    ],
  },
};

const SCALE = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];
const PER_DIMENSION = 5;

type Item = { dim: number; text: string; rev: boolean; pos: number };

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Five items per dimension: at least one reverse-worded, the rest drawn at random. */
function drawSession(): Item[] {
  return DIMENSIONS.flatMap((d, dim) => {
    const bank = ITEM_BANK[d.key];
    const [revPick, ...otherReverse] = shuffle(bank.reverse);
    const rest = shuffle([
      ...bank.normal.map((text) => ({ text, rev: false })),
      ...otherReverse.map((text) => ({ text, rev: true })),
    ]).slice(0, PER_DIMENSION - 1);
    return shuffle([{ text: revPick!, rev: true }, ...rest]).map((it, pos) => ({
      dim,
      pos,
      ...it,
    }));
  });
}

/* ---------- Browser storage (best-effort) ---------- */

const STORE = {
  history: "islf-5p:want-history",
  profile: "islf-5p:profile",
  actualized: "islf-5p:actualized",
};

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the session still works */
  }
}

/* ---------- Profile ---------- */

const EMPTY_PROFILE = {
  name: "",
  age: "",
  gender: "",
  location: "",
  qualification: "",
  profession: "",
  experience: "",
  organization: "",
};
type Profile = typeof EMPTY_PROFILE;

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

const PROFILE_FIELDS: { key: keyof Profile; label: string; type?: "number" | "select" }[] = [
  { key: "name", label: "Full name" },
  { key: "age", label: "Age", type: "number" },
  { key: "gender", label: "Gender", type: "select" },
  { key: "location", label: "Location" },
  { key: "qualification", label: "Qualification" },
  { key: "profession", label: "Profession / Role" },
  { key: "experience", label: "Experience (e.g. 8 years)" },
  { key: "organization", label: "Organization (optional)" },
];

function profileSummary(p: Profile) {
  return [
    p.name,
    p.age && `Age ${p.age}`,
    p.gender,
    p.profession,
    p.qualification,
    p.experience && `${p.experience} experience`,
    p.organization,
    p.location,
  ].filter(Boolean);
}

/* ---------- Scoring ---------- */

type HistoryEntry = { t: number; want: PerDim };

type Row = {
  key: DimKey;
  label: string;
  color: string;
  want: number;
  got: number;
  impact: number;
  impactCP: number;
  agency: number;
  commit: number | null;
  intentCP: number;
  actualize: boolean;
};

type Results = { scores: number[]; overall: number; rows: Row[]; sessions: number };

const evenSplit = (value: number): PerDim => ({
  people: value,
  planet: value,
  prosperity: value,
  peace: value,
  partnership: value,
});

function bandFor(score: number) {
  if (score < 40) return "Emerging";
  if (score < 60) return "Developing";
  if (score < 75) return "Steady";
  if (score < 90) return "Strong";
  return "Flourishing";
}

/** Consistency of the stated Want across sessions; needs at least two sessions. */
function commitmentScore(history: HistoryEntry[], want: PerDim, key: DimKey) {
  const series = [...history.map((h) => h.want?.[key] ?? 0), want[key]];
  if (series.length < 2) return null;
  const mean = series.reduce((a, b) => a + b, 0) / series.length;
  const variance = series.reduce((a, b) => a + (b - mean) ** 2, 0) / series.length;
  // Lower spread (relative to a realistic 0–40 swing) means higher commitment.
  return Math.max(0, Math.round(100 - (Math.sqrt(variance) / 40) * 100));
}

function cpTotals(rows: Row[]) {
  const assessment = 30;
  const intent = Math.min(
    20,
    rows.reduce((a, r) => a + r.intentCP, 0),
  );
  const actualization = rows.filter((r) => r.actualize).length * 40;
  const impact = rows.reduce((a, r) => a + r.impactCP, 0);
  return {
    assessment,
    intent,
    actualization,
    impact,
    total: assessment + intent + actualization + impact,
  };
}

/* ---------- Portrait: outer ring Harmony, inner ring Agency ---------- */

function ringPath(rIn: number, rOut: number, a0: number, a1: number) {
  const at = (r: number, a: number) => `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`;
  return `M${at(rOut, a0)} A${rOut},${rOut} 0 0 1 ${at(rOut, a1)} L${at(rIn, a1)} A${rIn},${rIn} 0 0 0 ${at(rIn, a0)} Z`;
}

function Wheel({ harmony, agency }: { harmony: number[]; agency: number[] }) {
  const outer = { min: 70, max: 92 };
  const inner = { min: 28, max: 64 };
  const n = DIMENSIONS.length;
  return (
    <svg viewBox="0 0 200 200" className="h-auto w-full max-w-[15rem]" aria-hidden="true">
      <circle cx="100" cy="100" r={outer.max} fill="none" stroke="var(--islf-stone)" />
      <circle cx="100" cy="100" r={outer.min} fill="none" stroke="var(--islf-stone)" />
      {DIMENSIONS.map((d, i) => {
        const a0 = (Math.PI * 2 * i) / n - Math.PI / 2;
        const a1 = (Math.PI * 2 * (i + 1)) / n - Math.PI / 2;
        const h = Math.max((harmony[i] ?? 0) / 100, 0.08);
        const a = Math.max((agency[i] ?? 0) / 100, 0.08);
        return (
          <g key={d.key} fill={d.color}>
            <path
              d={ringPath(outer.min, outer.min + (outer.max - outer.min) * h, a0, a1)}
              opacity="0.92"
            />
            <path
              d={ringPath(inner.min, inner.min + (inner.max - inner.min) * a, a0, a1)}
              opacity="0.6"
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Shared pieces ---------- */

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

function Likert({
  selected,
  onSelect,
}: {
  selected: number | null;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {SCALE.map((label, i) => {
        const active = selected === i + 1;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(i + 1)}
            className={
              active
                ? "group flex min-h-12 items-center justify-between gap-2 border border-islf-indigo bg-islf-indigo px-3.5 py-3 text-left text-sm text-islf-paper sm:min-h-24 sm:flex-col sm:items-start"
                : "group flex min-h-12 items-center justify-between gap-2 border border-islf-stone bg-islf-ivory/50 px-3.5 py-3 text-left text-sm transition-colors hover:border-islf-indigo hover:bg-islf-indigo hover:text-islf-paper sm:min-h-24 sm:flex-col sm:items-start"
            }
          >
            <span>{label}</span>
            <span
              className={
                active
                  ? "font-mono text-xs text-islf-paper/70"
                  : "font-mono text-xs text-islf-muted group-hover:text-islf-paper/70"
              }
              aria-hidden="true"
            >
              {i + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const KICKER = "islf-kicker text-[0.6rem] text-islf-magenta-text";
const PRIMARY_BTN =
  "h-11 bg-islf-indigo px-6 text-sm font-semibold text-islf-paper transition-colors hover:bg-islf-indigo-deep disabled:cursor-not-allowed disabled:opacity-40";
const GHOST_BTN =
  "h-11 border border-islf-ink/30 px-5 text-sm transition-colors hover:border-islf-indigo hover:text-islf-indigo";
const BACK_BTN = "text-sm text-islf-muted underline-offset-4 hover:text-islf-ink hover:underline";
const FIELD =
  "h-11 w-full border border-islf-stone bg-islf-ivory/50 px-3 text-sm text-islf-ink outline-none placeholder:text-islf-muted focus:border-islf-indigo";

type Screen = "intro" | "fivep" | "want" | "got" | "impact" | "results";

export function AssessmentWidget() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [idx, setIdx] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [want, setWant] = useState<PerDim>(evenSplit(20));
  const [got, setGot] = useState<PerDim>(evenSplit(3));
  const [impact, setImpact] = useState<PerDim>(evenSplit(0));
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [results, setResults] = useState<Results | null>(null);
  const headingRef = useRef<HTMLElement | null>(null);
  const started = useRef(false);

  // Earlier sessions (for Commitment) and saved details live in this browser only.
  useEffect(() => {
    const saved = readStore<HistoryEntry[]>(STORE.history, []);
    setHistory(Array.isArray(saved) ? saved : []);
    setProfile((p) => ({ ...p, ...readStore<Partial<Profile>>(STORE.profile, {}) }));
  }, []);

  // Move focus to the new prompt on every step so keyboard and screen-reader
  // users follow along; skip the very first render.
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [screen, idx]);

  const setFocusTarget = (el: HTMLElement | null) => {
    headingRef.current = el;
  };

  const go = (next: Screen, nextIdx = 0) => {
    setScreen(next);
    setIdx(nextIdx);
  };

  const begin = () => {
    const cleaned = Object.fromEntries(
      Object.entries(profile).map(([k, v]) => [k, v.trim()]),
    ) as Profile;
    setProfile(cleaned);
    writeStore(STORE.profile, cleaned);
    // A fresh draw every session, so there is no pattern to learn.
    const drawn = drawSession();
    setItems(drawn);
    setAnswers(new Array<number | null>(drawn.length).fill(null));
    go("fivep");
  };

  const answerItem = (value: number) => {
    setAnswers((prev) => prev.map((a, i) => (i === idx ? value : a)));
    if (idx < items.length - 1) setIdx(idx + 1);
    else go("want");
  };

  const answerGot = (value: number) => {
    const dim = DIMENSIONS[idx];
    if (!dim) return;
    setGot((prev) => ({ ...prev, [dim.key]: value }));
    if (idx < DIMENSIONS.length - 1) setIdx(idx + 1);
    else go("impact");
  };

  const back = () => {
    if (screen === "fivep") {
      if (idx > 0) setIdx(idx - 1);
      else go("intro");
    } else if (screen === "want") {
      go("fivep", items.length - 1);
    } else if (screen === "got") {
      if (idx > 0) setIdx(idx - 1);
      else go("want");
    } else if (screen === "impact") {
      go("got", DIMENSIONS.length - 1);
    }
  };

  const finish = () => {
    const scores = DIMENSIONS.map((_, dim) => {
      const vals = items.flatMap((it, i) => {
        if (it.dim !== dim) return [];
        const raw = answers[i] ?? 3;
        return [it.rev ? 6 - raw : raw];
      });
      const sum = vals.reduce((a, b) => a + b, 0);
      return Math.round((sum / (vals.length * 5)) * 1000) / 10;
    });
    const overall = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

    const flags = readStore<Partial<Record<DimKey, boolean>>>(STORE.actualized, {});
    const rows: Row[] = DIMENSIONS.map((d) => {
      const gotPct = (got[d.key] / 5) * 100;
      const impactPct = Math.min(100, impact[d.key] * 2);
      const commit = commitmentScore(history, want, d.key);
      return {
        key: d.key,
        label: d.label,
        color: d.color,
        want: want[d.key],
        got: gotPct,
        impact: impactPct,
        impactCP: Math.round(impact[d.key] * 0.5),
        agency: Math.round(0.2 * want[d.key] + 0.3 * gotPct + 0.5 * impactPct),
        commit,
        intentCP: Math.round((want[d.key] / 100) * ((commit ?? 50) / 100) * 8),
        // One-time bridge per dimension: a steady Want that now feels fulfilled.
        actualize: !flags[d.key] && commit != null && commit >= 75 && got[d.key] >= 4,
      };
    });

    const nextHistory = [...history, { t: Date.now(), want: { ...want } }].slice(-6);
    writeStore(STORE.history, nextHistory);
    const earned = rows.filter((r) => r.actualize);
    if (earned.length) {
      writeStore(STORE.actualized, {
        ...flags,
        ...Object.fromEntries(earned.map((r) => [r.key, true])),
      });
    }

    setResults({ scores, overall, rows, sessions: history.length + 1 });
    setHistory(nextHistory);
    go("results");
  };

  const reset = () => {
    setItems([]);
    setAnswers([]);
    setWant(evenSplit(20));
    setGot(evenSplit(3));
    setImpact(evenSplit(0));
    setResults(null);
    go("intro");
  };

  const item = items[idx];
  const itemDim = item ? DIMENSIONS[item.dim] : undefined;
  const gotDim = DIMENSIONS[idx];
  const remaining = 100 - Object.values(want).reduce((a, b) => a + b, 0);

  return (
    <section
      aria-label="5P Harmony and Agency Assessment"
      className="flex min-h-[27rem] w-full flex-col border-t-2 border-islf-indigo bg-islf-paper p-6 shadow-[0_30px_60px_-45px_rgb(41_45_43/0.45)] sm:p-10 print:border-0 print:p-0 print:shadow-none"
    >
      {screen === "intro" && (
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className={KICKER}>ISLF Assessment</p>
              <h3
                ref={setFocusTarget}
                tabIndex={-1}
                className="mt-3 text-[2rem] leading-tight outline-none"
              >
                5P Harmony &amp; Agency Check-in
              </h3>
              <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-islf-muted">
                Twenty-five rotating questions across the Five P&rsquo;s, then a short Agency
                reflection — what you want, how much you&rsquo;ve realized, and what it&rsquo;s
                created. Each visit draws a fresh set of questions, mixing direct and reverse-worded
                statements.
              </p>
            </div>
            <p className="text-xs tracking-wide text-islf-muted">
              25 questions + Agency · ~5 min · Private
            </p>
          </div>

          <ol className="grid grid-cols-2 border-t border-islf-stone sm:grid-cols-5">
            {DIMENSIONS.map((d, i) => (
              <li
                key={d.key}
                className="border-b border-islf-stone py-4 pr-3 sm:border-b-0 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-4"
              >
                <span className="font-mono text-[0.65rem] text-islf-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 flex items-center gap-2 font-islf-serif text-lg">
                  <Dot color={d.color} />
                  {d.label}
                </span>
                <span className="mt-0.5 block text-xs text-islf-muted">{d.hint}</span>
              </li>
            ))}
          </ol>

          <fieldset>
            <legend className="islf-kicker text-[0.6rem] text-islf-muted">
              Your details{" "}
              <span className="tracking-normal normal-case">(optional — shown on your report)</span>
            </legend>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {PROFILE_FIELDS.map((f) =>
                f.type === "select" ? (
                  <select
                    key={f.key}
                    aria-label={f.label}
                    value={profile[f.key]}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    className={FIELD}
                  >
                    <option value="">Gender — select</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    key={f.key}
                    type={f.type ?? "text"}
                    aria-label={f.label}
                    placeholder={f.label}
                    value={profile[f.key]}
                    onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                    {...(f.type === "number" ? { min: 1, max: 120 } : { maxLength: 80 })}
                    className={FIELD}
                  />
                ),
              )}
            </div>
          </fieldset>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-islf-muted">
              Your answers stay in this browser and are never sent anywhere.
            </p>
            <button type="button" onClick={begin} className={PRIMARY_BTN}>
              Begin →
            </button>
          </div>
        </div>
      )}

      {screen === "fivep" && item && itemDim && (
        <div className="flex flex-1 flex-col gap-7">
          <div className="flex items-center justify-between gap-4">
            <p className="islf-kicker flex items-center gap-2 text-[0.6rem] text-islf-muted">
              <Dot color={itemDim.color} />
              5P Harmony · {itemDim.label} — {item.pos + 1} of {PER_DIMENSION}
            </p>
            <span className="font-mono text-xs text-islf-muted">
              {idx + 1} / {items.length}
            </span>
          </div>
          <div
            className="h-0.5 w-full bg-islf-stone"
            role="progressbar"
            aria-label="Progress"
            aria-valuemin={1}
            aria-valuemax={items.length}
            aria-valuenow={idx + 1}
          >
            <div
              className="h-0.5 transition-[width] duration-300"
              style={{
                width: `${((idx + 1) / items.length) * 100}%`,
                backgroundColor: itemDim.color,
              }}
            />
          </div>
          <fieldset className="flex flex-col gap-7">
            <legend
              ref={setFocusTarget}
              tabIndex={-1}
              aria-live="polite"
              className="font-islf-serif text-[1.55rem] leading-snug outline-none sm:min-h-[5.2rem] sm:text-[1.9rem]"
            >
              <span className="sr-only">
                Question {idx + 1} of {items.length}:{" "}
              </span>
              {item.text}
            </legend>
            <Likert selected={answers[idx] ?? null} onSelect={answerItem} />
          </fieldset>
          <div className="mt-auto">
            <button type="button" onClick={back} className={BACK_BTN}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {screen === "want" && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <p className={KICKER}>Agency — Want</p>
            <h3
              ref={setFocusTarget}
              tabIndex={-1}
              className="mt-3 text-[1.7rem] leading-tight outline-none"
            >
              Where does your desire live right now?
            </h3>
            <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-islf-muted">
              Distribute 100 points across the five P&rsquo;s based on where you most want growth or
              change — not where you&rsquo;re already strongest. You can&rsquo;t max every
              dimension; this is about relative priority.
            </p>
          </div>
          <p
            className="flex items-center justify-between border border-islf-stone bg-islf-ivory/60 px-4 py-3 text-sm"
            aria-live="polite"
          >
            <span>Remaining to allocate</span>
            <span
              className={`font-islf-serif text-2xl ${remaining < 0 ? "text-islf-magenta-text" : "text-islf-indigo"}`}
            >
              {remaining}
            </span>
          </p>
          <div className="grid gap-4">
            {DIMENSIONS.map((d) => (
              <label key={d.key} className="block">
                <span className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Dot color={d.color} />
                    {d.label}
                  </span>
                  <span className="font-islf-serif text-lg">{want[d.key]}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={want[d.key]}
                  onChange={(e) => setWant({ ...want, [d.key]: Number(e.target.value) })}
                  className="mt-1.5 w-full"
                  style={{ accentColor: d.color }}
                />
              </label>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between gap-4">
            <button type="button" onClick={back} className={BACK_BTN}>
              ← Back
            </button>
            <button
              type="button"
              onClick={() => go("got")}
              disabled={remaining !== 0}
              className={PRIMARY_BTN}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {screen === "got" && gotDim && (
        <div className="flex flex-1 flex-col gap-7">
          <div className="flex items-center justify-between gap-4">
            <p className="islf-kicker flex items-center gap-2 text-[0.6rem] text-islf-muted">
              <Dot color={gotDim.color} />
              Agency — Got · {gotDim.label}
            </p>
            <span className="font-mono text-xs text-islf-muted">
              {idx + 1} / {DIMENSIONS.length}
            </span>
          </div>
          <fieldset className="flex flex-col gap-7">
            <legend
              ref={setFocusTarget}
              tabIndex={-1}
              aria-live="polite"
              className="font-islf-serif text-[1.55rem] leading-snug outline-none sm:text-[1.9rem]"
            >
              How much of your want in {gotDim.label} feels fulfilled right now?
            </legend>
            <Likert selected={got[gotDim.key]} onSelect={answerGot} />
          </fieldset>
          <div className="mt-auto">
            <button type="button" onClick={back} className={BACK_BTN}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {screen === "impact" && (
        <div className="flex flex-1 flex-col gap-6">
          <div>
            <p className={KICKER}>Agency — Impact</p>
            <h3
              ref={setFocusTarget}
              tabIndex={-1}
              className="mt-3 text-[1.7rem] leading-tight outline-none"
            >
              Impact isn&rsquo;t self-rated
            </h3>
            <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-islf-muted">
              Impact comes from verified Contribution (CP) activity in each dimension. No
              Contribution Engine is connected here yet, so enter a placeholder &ldquo;verified CP
              earned&rdquo; figure per dimension to see how it would flow through.
            </p>
          </div>
          <div className="grid gap-2">
            {DIMENSIONS.map((d) => (
              <label
                key={d.key}
                className="flex items-center justify-between gap-4 border border-islf-stone bg-islf-ivory/60 px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Dot color={d.color} />
                  {d.label}
                </span>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={impact[d.key]}
                  onChange={(e) => {
                    const n = Math.round(Number(e.target.value));
                    setImpact({
                      ...impact,
                      [d.key]: Number.isFinite(n) ? Math.min(500, Math.max(0, n)) : 0,
                    });
                  }}
                  className="h-10 w-24 border border-islf-stone bg-islf-paper px-2 text-right outline-none focus:border-islf-indigo"
                />
              </label>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between gap-4">
            <button type="button" onClick={back} className={BACK_BTN}>
              ← Back
            </button>
            <button type="button" onClick={finish} className={PRIMARY_BTN}>
              See my results
            </button>
          </div>
        </div>
      )}

      {screen === "results" && results && (
        <ResultsView
          results={results}
          profile={profile}
          setFocusTarget={setFocusTarget}
          onReset={reset}
        />
      )}
    </section>
  );
}

function ResultsView({
  results,
  profile,
  setFocusTarget,
  onReset,
}: {
  results: Results;
  profile: Profile;
  setFocusTarget: (el: HTMLElement | null) => void;
  onReset: () => void;
}) {
  const { scores, overall, rows, sessions } = results;
  const lowest = DIMENSIONS[scores.indexOf(Math.min(...scores))];
  const cp = cpTotals(rows);
  const summary = profileSummary(profile);

  return (
    <div className="flex flex-1 flex-col gap-8" data-print-report>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={KICKER}>Session complete</p>
          <h3
            ref={setFocusTarget}
            tabIndex={-1}
            className="mt-3 text-[2rem] leading-tight outline-none"
          >
            Your Harmony &amp; Agency Report
          </h3>
          {summary.length ? (
            <p className="mt-2 text-sm text-islf-muted">{summary.join(" · ")}</p>
          ) : null}
          <p className="mt-2 text-sm text-islf-muted">
            Lowest dimension right now: <em className="text-islf-magenta-text">{lowest?.label}</em>
          </p>
        </div>
        <div className="text-right">
          <p className="font-islf-serif text-[3.4rem] leading-none text-islf-indigo">{overall}</p>
          <p className="mt-1.5 text-xs text-islf-muted">overall harmony · {bandFor(overall)}</p>
        </div>
      </div>

      <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
        <figure className="mx-auto w-48 sm:w-56">
          <Wheel harmony={scores} agency={rows.map((r) => r.agency)} />
          <figcaption className="mt-2 text-center text-[0.7rem] text-islf-muted">
            Outer — Harmony · Inner — Agency
          </figcaption>
        </figure>
        <ul className="border-t border-islf-stone">
          {DIMENSIONS.map((d, i) => (
            <li key={d.key} className="border-b border-islf-stone py-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Dot color={d.color} />
                  {d.label}
                </span>
                <span className="font-mono text-xs">{scores[i] ?? 0}</span>
              </div>
              <div className="mt-2 h-0.5 w-full bg-islf-stone">
                <div
                  className="h-0.5"
                  style={{ width: `${scores[i] ?? 0}%`, backgroundColor: d.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="islf-kicker text-[0.6rem] text-islf-muted">Agency breakdown</h4>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-islf-stone text-xs text-islf-muted">
                {["Dimension", "Want", "Got", "Impact", "Agency", "Commitment"].map((h) => (
                  <th key={h} scope="col" className="py-2 pr-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-islf-stone">
                  <th scope="row" className="py-2.5 pr-3 font-normal">
                    <span className="flex items-center gap-2">
                      <Dot color={r.color} />
                      {r.label}
                    </span>
                  </th>
                  <td className="py-2.5 pr-3">{r.want}</td>
                  <td className="py-2.5 pr-3">{Math.round(r.got)}</td>
                  <td className="py-2.5 pr-3">{Math.round(r.impact)}</td>
                  <td className="py-2.5 pr-3 font-semibold text-islf-indigo">{r.agency}</td>
                  <td className="py-2.5 pr-3">{r.commit ?? "building…"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-islf-muted">
          Commitment needs at least two sessions to calculate — it&rsquo;s the consistency of your
          stated Want over time, not a single answer.{" "}
          {sessions < 2
            ? "This is your first recorded session; retake later to see it populate."
            : `Based on ${sessions} sessions so far.`}
        </p>
      </div>

      <div className="border border-islf-stone bg-islf-ivory/60 p-5 sm:p-6">
        <h4 className="font-islf-serif text-xl">CP earned this session</h4>
        <dl className="mt-3 text-sm">
          {[
            ["Assessment completed", "Engagement · not ITC-eligible", cp.assessment],
            ["Intent (Want × Commitment)", "capped 20 · not ITC-eligible", cp.intent],
            ["Actualization bridge", "one-time per dimension", cp.actualization],
            ["Impact", "ITC-eligible", cp.impact],
          ].map(([label, tag, value]) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 border-b border-islf-stone py-2.5"
            >
              <dt>
                {label} <span className="ml-1 text-[0.7rem] text-islf-muted">{tag}</span>
              </dt>
              <dd className="font-mono text-xs whitespace-nowrap">+{value} CP</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 pt-3 font-semibold text-islf-indigo">
            <dt>Total awarded</dt>
            <dd className="whitespace-nowrap">{cp.total} CP</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-islf-muted">
          Impact figures above are placeholder inputs standing in for the Contribution Engine —
          Impact CP is never self-entered once it is connected.
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 print:hidden">
        <p className="text-xs text-islf-muted">
          Save as PDF opens your browser&rsquo;s print dialog — choose &ldquo;Save as PDF&rdquo;.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={() => window.print()} className={GHOST_BTN}>
            Save as PDF
          </button>
          <button type="button" onClick={onReset} className={PRIMARY_BTN}>
            New session
          </button>
        </div>
      </div>
    </div>
  );
}
