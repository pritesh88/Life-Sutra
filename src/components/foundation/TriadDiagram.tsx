import { cn } from "@/lib/utils";

const C = { x: 240, y: 252 };
const R = 108;
const OFFSET = 62;
const RING = 206;

/** Two decimals is plenty for an SVG this size and keeps the markup short. */
const round = (n: number) => Math.round(n * 100) / 100;

/** Circle centres at the three vertices of an equilateral triangle around C. */
const NODES = [-90, 150, 30].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return { x: round(C.x + OFFSET * Math.cos(rad)), y: round(C.y + OFFSET * Math.sin(rad)) };
});

const LABELS = [
  { word: "Work", sub: "Green Habitat", x: 240, y: 150, size: 20 },
  { word: "Life", sub: "Coaching", x: 136, y: 322, size: 20 },
  { word: "Consciousness", sub: "Self · Mind", x: 348, y: 322, size: 15 },
];

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const rad = ((i * 5 - 90) * Math.PI) / 180;
  const long = i % 6 === 0;
  return {
    x1: round(C.x + RING * Math.cos(rad)),
    y1: round(C.y + RING * Math.sin(rad)),
    x2: round(C.x + (RING - (long ? 10 : 5)) * Math.cos(rad)),
    y2: round(C.y + (RING - (long ? 10 : 5)) * Math.sin(rad)),
    long,
  };
});

/**
 * Work · Life · Consciousness as three overlapping fields inside a measured
 * ring — the foundation's approach drawn as an instrument, not an emblem.
 * Strokes use currentColor; the centre uses the terracotta accent.
 * Decorative: the same content is always in the page text.
 */
export function TriadDiagram({
  className,
  labels = true,
  ring = true,
  animate = true,
}: {
  className?: string | undefined;
  labels?: boolean;
  ring?: boolean;
  animate?: boolean;
}) {
  const draw = animate ? "islf-draw" : undefined;
  return (
    <svg
      viewBox="0 0 480 504"
      className={cn("h-auto w-full", className)}
      aria-hidden="true"
      fill="none"
    >
      {ring ? (
        <>
          <circle
            cx={C.x}
            cy={C.y}
            r={RING}
            stroke="currentColor"
            strokeOpacity="0.3"
            className={draw}
            style={{ ["--islf-dash" as string]: 1300 }}
          />
          <g stroke="currentColor">
            {TICKS.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                strokeOpacity={t.long ? 0.5 : 0.2}
              />
            ))}
          </g>
        </>
      ) : null}

      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={R}
          stroke="currentColor"
          strokeOpacity="0.85"
          strokeWidth="1.1"
          className={draw}
          style={{ ["--islf-dash" as string]: 700, animationDelay: `${0.25 + i * 0.2}s` }}
        />
      ))}

      <polygon
        points={NODES.map((n) => `${n.x},${n.y}`).join(" ")}
        stroke="var(--islf-magenta)"
        strokeOpacity="0.85"
        strokeDasharray="2 5"
      />
      {NODES.map((n, i) => (
        <circle key={`d${i}`} cx={n.x} cy={n.y} r="2.5" fill="currentColor" />
      ))}
      <circle cx={C.x} cy={C.y} r="5" fill="var(--islf-magenta)" />
      <circle cx={C.x} cy={C.y} r="12" stroke="var(--islf-magenta)" strokeOpacity="0.6" />

      {labels
        ? LABELS.map((l) => (
            <g key={l.word}>
              <text
                x={l.x}
                y={l.y}
                textAnchor="middle"
                fill="currentColor"
                style={{ fontFamily: "var(--font-newsreader)", fontSize: l.size }}
              >
                {l.word}
              </text>
              <text
                x={l.x}
                y={l.y + 17}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity="0.7"
                style={{
                  fontFamily: "var(--font-public-sans)",
                  fontSize: 8.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                {l.sub}
              </text>
            </g>
          ))
        : null}
    </svg>
  );
}

/** The triad reduced to a small mark, used as a section and list marker. */
export function TriadMark({ className }: { className?: string | undefined }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true" fill="none">
      <circle cx="12" cy="9" r="5.5" stroke="currentColor" />
      <circle cx="8.9" cy="14.4" r="5.5" stroke="currentColor" />
      <circle cx="15.1" cy="14.4" r="5.5" stroke="currentColor" />
      <circle cx="12" cy="12.6" r="1.4" fill="var(--islf-magenta)" />
    </svg>
  );
}
