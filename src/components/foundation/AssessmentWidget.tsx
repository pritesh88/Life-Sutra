"use client";

import { useEffect, useRef, useState } from "react";

/*
 * 5P Harmony Quick Check. Questions, scale, scoring and result wording are
 * unchanged from the original Life Sutra footer widget — only presentation
 * and accessibility have changed.
 */

const DIMENSIONS = [
  { key: "people", label: "People", hint: "Care & belonging", color: "#b76e52" },
  { key: "planet", label: "Planet", hint: "Mindful living", color: "#6f8a62" },
  { key: "prosperity", label: "Prosperity", hint: "Security & needs", color: "#b08a45" },
  { key: "peace", label: "Peace", hint: "Inner calm", color: "#6e8296" },
  { key: "partnership", label: "Partnership", hint: "Shared purpose", color: "#8e6a80" },
];

const QUESTIONS = [
  "I feel genuinely cared for by the people close to me.",
  "I am conscious of how my daily choices affect the environment.",
  "I feel financially secure enough to meet my basic needs.",
  "I generally feel calm rather than reactive in daily situations.",
  "I actively collaborate with others toward shared goals.",
];

const SCALE = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

/** Point on the pentagon chart for dimension i at radius r (0–1). */
function point(i: number, r: number) {
  const a = ((-90 + i * 72) * Math.PI) / 180;
  return [100 + 78 * r * Math.cos(a), 100 + 78 * r * Math.sin(a)] as const;
}

/** Five-axis view of the same per-dimension percentages listed beside it. */
function HarmonyChart({ answers }: { answers: number[] }) {
  const shape = DIMENSIONS.map((_, i) => point(i, (answers[i] ?? 0) / 5).join(",")).join(" ");
  return (
    <svg viewBox="0 0 200 200" className="h-auto w-full max-w-[15rem]" aria-hidden="true">
      {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
        <polygon
          key={r}
          points={DIMENSIONS.map((_, i) => point(i, r).join(",")).join(" ")}
          fill="none"
          stroke="var(--islf-stone)"
          strokeWidth={r === 1 ? 1.2 : 0.8}
        />
      ))}
      {DIMENSIONS.map((d, i) => {
        const [x, y] = point(i, 1);
        return <line key={d.key} x1="100" y1="100" x2={x} y2={y} stroke="var(--islf-stone)" />;
      })}
      <polygon
        points={shape}
        fill="color-mix(in oklab, var(--islf-indigo) 16%, transparent)"
        stroke="var(--islf-indigo)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {DIMENSIONS.map((d, i) => {
        const [x, y] = point(i, (answers[i] ?? 0) / 5);
        return <circle key={d.key} cx={x} cy={y} r="3.2" fill={d.color} />;
      })}
    </svg>
  );
}

export function AssessmentWidget() {
  const [step, setStep] = useState<"intro" | "questions" | "results">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const headingRef = useRef<HTMLElement | null>(null);
  const started = useRef(false);

  // Move focus to the new prompt on every step so keyboard and screen-reader
  // users follow along; skip the very first render.
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step, currentQ]);

  const handleSelect = (val: number) => {
    const nextAnswers = [...answers, val];
    setAnswers(nextAnswers);
    if (currentQ + 1 < QUESTIONS.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep("results");
    }
  };

  const back = () => {
    if (currentQ === 0) {
      setStep("intro");
      return;
    }
    setAnswers(answers.slice(0, -1));
    setCurrentQ(currentQ - 1);
  };

  const reset = () => {
    setAnswers([]);
    setCurrentQ(0);
    setStep("intro");
  };

  const overall = answers.length
    ? Math.round((answers.reduce((sum, a) => sum + a, 0) / answers.length) * 20)
    : 0;
  const ranked = DIMENSIONS.map((d, i) => ({ ...d, score: answers[i] ?? 0 })).sort(
    (a, b) => b.score - a.score,
  );
  const highest = ranked[0];
  const lowest = ranked[ranked.length - 1];
  const balanced = !highest || !lowest || highest.score === lowest.score;

  const setFocusTarget = (el: HTMLElement | null) => {
    headingRef.current = el;
  };

  return (
    <section
      aria-label="5P Harmony Quick Check"
      className="flex min-h-[27rem] w-full flex-col border-t-2 border-islf-indigo bg-islf-paper p-6 shadow-[0_30px_60px_-45px_rgb(41_45_43/0.45)] sm:p-10"
    >
      {step === "intro" && (
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="islf-kicker text-[0.6rem] text-islf-magenta-text">ISLF Assessment</p>
              <h3
                ref={setFocusTarget}
                tabIndex={-1}
                className="mt-3 text-[2rem] leading-tight outline-none"
              >
                5P Harmony Quick Check
              </h3>
              <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-islf-muted">
                Five statements, one for each dimension of a balanced life. Rate how true each feels
                for you right now.
              </p>
            </div>
            <p className="text-xs tracking-wide text-islf-muted">5 questions · ~1 min · Private</p>
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
                  <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.label}
                </span>
                <span className="mt-0.5 block text-xs text-islf-muted">{d.hint}</span>
              </li>
            ))}
          </ol>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-islf-muted">
              Your answers stay in this browser and are never sent anywhere.
            </p>
            <button
              type="button"
              onClick={() => setStep("questions")}
              className="h-11 bg-islf-indigo px-6 text-sm font-semibold text-islf-paper transition-colors hover:bg-islf-indigo-deep"
            >
              Start check-in →
            </button>
          </div>
        </div>
      )}

      {step === "questions" && (
        <div className="flex flex-1 flex-col gap-7">
          <div className="flex items-center justify-between">
            <p className="islf-kicker flex items-center gap-2 text-[0.6rem] text-islf-muted">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: DIMENSIONS[currentQ]?.color }}
                aria-hidden="true"
              />
              {DIMENSIONS[currentQ]?.label} · {DIMENSIONS[currentQ]?.hint}
            </p>
            <span className="font-mono text-xs text-islf-muted">
              {currentQ + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div
            className="grid grid-cols-5 gap-1.5"
            role="progressbar"
            aria-label="Progress"
            aria-valuemin={1}
            aria-valuemax={QUESTIONS.length}
            aria-valuenow={currentQ + 1}
          >
            {DIMENSIONS.map((d, i) => (
              <span
                key={d.key}
                className="h-0.5 bg-islf-stone transition-colors"
                style={i <= currentQ ? { backgroundColor: d.color } : undefined}
              />
            ))}
          </div>
          <fieldset className="flex flex-col gap-7">
            <legend
              ref={setFocusTarget}
              tabIndex={-1}
              aria-live="polite"
              className="font-islf-serif text-[1.55rem] leading-snug outline-none sm:text-[2rem]"
            >
              <span className="sr-only">
                Question {currentQ + 1} of {QUESTIONS.length}:{" "}
              </span>
              {QUESTIONS[currentQ]}
            </legend>
            <div className="grid gap-2 sm:grid-cols-5">
              {SCALE.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSelect(i + 1)}
                  className="group flex min-h-12 items-center justify-between gap-2 border border-islf-stone bg-islf-ivory/50 px-3.5 py-3 text-left text-sm transition-colors hover:border-islf-indigo hover:bg-islf-indigo hover:text-islf-paper sm:min-h-24 sm:flex-col sm:items-start"
                >
                  <span>{label}</span>
                  <span
                    className="font-mono text-xs text-islf-muted group-hover:text-islf-paper/70"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-auto">
            <button
              type="button"
              onClick={back}
              className="text-sm text-islf-muted underline-offset-4 hover:text-islf-ink hover:underline"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {step === "results" && (
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="islf-kicker text-[0.6rem] text-islf-magenta-text">ISLF Assessment</p>
              <h3
                ref={setFocusTarget}
                tabIndex={-1}
                className="mt-3 text-[2rem] leading-tight outline-none"
              >
                Your Harmony Snapshot
              </h3>
            </div>
            <div className="text-right">
              <p className="font-islf-serif text-[3.4rem] leading-none text-islf-indigo">
                {overall}%
              </p>
              <p className="mt-1.5 text-xs text-islf-muted">overall harmony</p>
            </div>
          </div>

          <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
            <div className="mx-auto w-48 sm:w-56">
              <HarmonyChart answers={answers} />
            </div>
            <ul className="border-t border-islf-stone">
              {DIMENSIONS.map((d, i) => {
                const pct = answers[i] ? answers[i] * 20 : 0;
                return (
                  <li key={d.key} className="border-b border-islf-stone py-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        {d.label}
                      </span>
                      <span className="font-mono text-xs">{answers[i] ? `${pct}%` : "–"}</span>
                    </div>
                    <div className="mt-2 h-0.5 w-full bg-islf-stone">
                      <div
                        className="h-0.5"
                        style={{ width: `${pct}%`, backgroundColor: d.color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-md font-islf-serif text-lg leading-snug" aria-live="polite">
              {balanced ? (
                "You are evenly balanced across all five dimensions."
              ) : (
                <>
                  Strongest in <em className="text-islf-indigo">{highest.label}</em>. Consider
                  giving a little more attention to{" "}
                  <em className="text-islf-magenta-text">{lowest.label}</em>.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={reset}
              className="h-11 border border-islf-ink/30 px-5 text-sm transition-colors hover:border-islf-indigo hover:text-islf-indigo"
            >
              Retake
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
