"use client";

import { useState } from "react";
import { Eyebrow } from "./primitives";

const DIMENSIONS = [
  { key: "people", label: "People", hint: "Care & belonging", color: "var(--saffron)" },
  { key: "planet", label: "Planet", hint: "Mindful living", color: "var(--accent)" },
  { key: "prosperity", label: "Prosperity", hint: "Security & needs", color: "var(--gold)" },
  { key: "peace", label: "Peace", hint: "Inner calm", color: "#8FA3C4" },
  { key: "partnership", label: "Partnership", hint: "Shared purpose", color: "#B892B4" },
];

const QUESTIONS = [
  "I feel genuinely cared for by the people close to me.",
  "I am conscious of how my daily choices affect the environment.",
  "I feel financially secure enough to meet my basic needs.",
  "I generally feel calm rather than reactive in daily situations.",
  "I actively collaborate with others toward shared goals.",
];

const SCALE = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

export function AssessmentWidget() {
  const [step, setStep] = useState<"intro" | "questions" | "results">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

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

  return (
    <section
      aria-label="5P Harmony Quick Check"
      className="flex h-full w-full flex-col rounded-md border border-earth-foreground/15 bg-earth-foreground/[0.04] p-6 text-earth-foreground"
    >
      {step === "intro" && (
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Eyebrow className="text-earth-foreground/60">ISLF Assessment</Eyebrow>
              <h3 className="mt-3 text-xl text-earth-foreground">5P Harmony Quick Check</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-earth-foreground/75">
                Five statements, one for each dimension of a balanced life. Rate how true each feels
                for you right now.
              </p>
            </div>
            <p className="text-xs tracking-wide text-earth-foreground/60">
              5 questions · ~1 min · Private
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {DIMENSIONS.map((d) => (
              <li
                key={d.key}
                className="rounded-md border border-earth-foreground/15 px-3 py-2.5"
                style={{ borderTopColor: d.color, borderTopWidth: 2 }}
              >
                <span className="flex items-center gap-2 text-sm text-earth-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.label}
                </span>
                <span className="mt-1 block text-xs text-earth-foreground/60">{d.hint}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-earth-foreground/60">
              Your answers stay in this browser and are never sent anywhere.
            </p>
            <button
              type="button"
              onClick={() => setStep("questions")}
              className="rounded-md bg-saffron px-5 py-2.5 text-sm font-semibold text-earth transition hover:bg-gold"
            >
              Start check-in →
            </button>
          </div>
        </div>
      )}

      {step === "questions" && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex items-center justify-between">
            <Eyebrow className="text-earth-foreground/60">
              {DIMENSIONS[currentQ]?.label} · {DIMENSIONS[currentQ]?.hint}
            </Eyebrow>
            <span className="text-xs tracking-wide text-earth-foreground/60">
              {currentQ + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
            {DIMENSIONS.map((d, i) => (
              <span
                key={d.key}
                className="h-1 rounded-full bg-earth-foreground/10 transition-colors"
                style={i <= currentQ ? { backgroundColor: d.color } : undefined}
              />
            ))}
          </div>
          <p className="font-display text-lg leading-snug sm:text-xl">{QUESTIONS[currentQ]}</p>
          <div className="grid gap-2 sm:grid-cols-5">
            {SCALE.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSelect(i + 1)}
                className="flex items-center justify-between gap-2 rounded-md border border-earth-foreground/15 px-3 py-2.5 text-left text-xs text-earth-foreground/85 transition hover:border-gold hover:bg-earth-foreground/[0.06] hover:text-earth-foreground sm:flex-col sm:items-start"
              >
                <span>{label}</span>
                <span className="text-earth-foreground/50">{i + 1}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto">
            <button
              type="button"
              onClick={back}
              className="link-underline text-sm text-earth-foreground/70 hover:text-earth-foreground"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {step === "results" && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Eyebrow className="text-earth-foreground/60">ISLF Assessment</Eyebrow>
              <h3 className="mt-3 text-xl text-earth-foreground">Your Harmony Snapshot</h3>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl leading-none text-earth-foreground">{overall}%</p>
              <p className="mt-1 text-xs text-earth-foreground/60">overall harmony</p>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-5">
            {DIMENSIONS.map((d, i) => {
              const pct = answers[i] ? answers[i] * 20 : 0;
              return (
                <li
                  key={d.key}
                  className="rounded-md border border-earth-foreground/15 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-earth-foreground/85">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.label}
                    </span>
                    <span className="font-semibold">{answers[i] ? `${pct}%` : "–"}</span>
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full bg-earth-foreground/10">
                    <div
                      className="h-1 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: d.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <p className="max-w-md text-sm leading-relaxed text-earth-foreground/75">
              {balanced ? (
                "You are evenly balanced across all five dimensions."
              ) : (
                <>
                  Strongest in <span className="text-earth-foreground">{highest.label}</span>.
                  Consider giving a little more attention to{" "}
                  <span className="text-earth-foreground">{lowest.label}</span>.
                </>
              )}
            </p>
            <button
              type="button"
              onClick={reset}
              className="link-underline text-sm text-earth-foreground/85 hover:text-earth-foreground"
            >
              Retake
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
