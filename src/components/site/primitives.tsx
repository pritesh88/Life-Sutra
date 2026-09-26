import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Layout ---------- */

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

export function Section({
  children,
  className,
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "parchment" | "earth";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20",
        tone === "parchment" && "bg-parchment",
        tone === "earth" && "bg-earth text-earth-foreground",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Ornament({ className }: { className?: string }) {
  return <div className={cn("rule-ornament w-full", className)} aria-hidden="true" />;
}

/* ---------- Typography ---------- */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow", className)}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <h2 className="text-2xl leading-snug sm:text-3xl">{title}</h2>
        {description ? (
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ---------- Actions ---------- */

const actionStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        ink: "bg-ink text-background hover:bg-ink/88",
        outline: "border border-border bg-card text-foreground hover:border-primary hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        saffron: "bg-saffron text-primary-foreground hover:bg-saffron/90",
        onEarth:
          "border border-earth-foreground/30 text-earth-foreground hover:bg-earth-foreground/10",
        quiet: "text-primary hover:text-primary/80",
      },
      size: {
        sm: "h-9 px-3.5",
        md: "h-11 px-5",
        lg: "h-12 px-6 text-[0.95rem]",
        none: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ActionProps = VariantProps<typeof actionStyles> & {
  to: string;
  children: ReactNode;
  className?: string;
};

export function Action({ to, children, variant, size, className }: ActionProps) {
  return (
    <Link href={to} className={cn(actionStyles({ variant, size }), className)}>
      {children}
    </Link>
  );
}

export function ActionButton({
  children,
  variant,
  size,
  className,
  type = "button",
  onClick,
}: VariantProps<typeof actionStyles> & {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(actionStyles({ variant, size }), className)}
    >
      {children}
    </button>
  );
}

/* ---------- Small pieces ---------- */

export function Tag({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "saffron" | "leaf" | "gold";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide uppercase",
        tone === "default" && "border-border bg-muted text-muted-foreground",
        tone === "saffron" && "border-saffron/40 bg-saffron/12 text-earth",
        tone === "leaf" && "border-leaf/35 bg-leaf/10 text-leaf",
        tone === "gold" && "border-gold/50 bg-gold/15 text-earth",
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  as: As = "article",
}: {
  children: ReactNode;
  className?: string;
  as?: "article" | "div" | "li";
}) {
  return (
    <As
      className={cn(
        "group relative flex flex-col rounded-md border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-raised",
        className,
      )}
    >
      {As === "article" ? (
        <span
          aria-hidden="true"
          className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
        />
      ) : null}
      {children}
    </As>
  );
}

export function MetaRow({
  items,
  className,
}: {
  items: (string | undefined)[];
  className?: string;
}) {
  const clean = items.filter(Boolean) as string[];
  return (
    <p className={cn("text-xs tracking-wide text-muted-foreground", className)}>
      {clean.map((item, i) => (
        <span key={item}>
          {i > 0 ? <span className="px-2 text-rule">·</span> : null}
          {item}
        </span>
      ))}
    </p>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-rule pl-4">
      <p className="font-display text-3xl leading-none text-ink">{value}</p>
      <p className="mt-2 text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  );
}

/* ---------- Page header ---------- */

export function PageHero({
  eyebrow,
  title,
  lede,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  meta?: string[];
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-border bg-parchment">
      <div className="jaali pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
      <Container className="relative py-14 sm:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 max-w-3xl text-3xl leading-tight sm:text-[2.6rem]">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{lede}</p>
        {meta ? <MetaRow className="mt-6" items={meta} /> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </header>
  );
}
