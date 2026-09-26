"use client";

import { useState } from "react";
import { Eyebrow } from "./primitives";

const DIMENSIONS = [
  { key: "people", label: "People", color: "var(--saffron)" },
  { key: "planet", label: "Planet", color: "var(--accent)" },
  { key: "prosperity", label: "Prosperity", color: "var(--gold)" },
  { key: "peace", label: "Peace", color: "#8FA3C4" },
  { key: "partnership", label: "Partnership", color: "#B892B4" },
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

  const reset = () => {
    setAnswers([]);
    setCurrentQ(0);
    setStep("intro");
  };

  return (
    <section
      aria-label="5P Harmony Quick Check"
      className="w-full rounded-md border border-earth-foreground/15 bg-earth-foreground/[0.04] p-6 text-earth-foreground"
    >
      {step === "intro" && (
        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <Eyebrow className="text-earth-foreground/60">ISLF Assessment</Eyebrow>
            <h3 className="mt-3 text-xl text-earth-foreground">5P Harmony Quick Check</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-earth-foreground/75">
              A quick check-in across People, Planet, Prosperity, Peace, and Partnership.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep("questions")}
            className="rounded-md bg-saffron px-5 py-2.5 text-sm font-semibold text-earth transition hover:bg-gold"
          >
            Start check-in
          </button>
        </div>
      )}

      {step === "questions" && (
        <div>
          <div className="flex items-center justify-between">
            <Eyebrow className="text-earth-foreground/60">{DIMENSIONS[currentQ]?.label}</Eyebrow>
            <span className="text-xs tracking-wide text-earth-foreground/60">
              {currentQ + 1} / {QUESTIONS.length}
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-earth-foreground/15">
            <div
              className="h-px bg-gold transition-all"
              style={{ width: `${(currentQ / QUESTIONS.length) * 100}%` }}
            />
          </div>
          <p className="mt-4 font-display text-lg leading-snug">{QUESTIONS[currentQ]}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {SCALE.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSelect(i + 1)}
                className="flex items-center justify-between gap-2 rounded-md border border-earth-foreground/15 px-3 py-2 text-left text-xs text-earth-foreground/85 transition hover:border-gold hover:bg-earth-foreground/[0.06] hover:text-earth-foreground sm:flex-col sm:items-start"
              >
                <span>{label}</span>
                <span className="text-earth-foreground/50">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "results" && (
        <div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Eyebrow className="text-earth-foreground/60">ISLF Assessment</Eyebrow>
              <h3 className="mt-3 text-xl text-earth-foreground">Your Harmony Snapshot</h3>
            </div>
            <button
              type="button"
              onClick={reset}
              className="link-underline text-sm text-earth-foreground/85 hover:text-earth-foreground"
            >
              Retake
            </button>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-5">
            {DIMENSIONS.map((d, i) => {
              const pct = answers[i] ? answers[i] * 20 : 0;
              return (
                <li key={d.key} className="rounded-md border border-earth-foreground/15 px-3 py-2.5">
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
        </div>
      )}
    </section>
  );
}
