import type { Conference } from "@/data/content";
import { Card, MetaRow, Tag } from "@/components/site/primitives";

type ConferenceCardProps = {
  conference: Conference;
  variant?: "full" | "summary";
};

export function ConferenceCard({ conference, variant = "full" }: ConferenceCardProps) {
  if (variant === "summary") {
    return (
      <Card as="li" className="p-5">
        <Tag tone="gold">{conference.status}</Tag>
        <h4 className="mt-3 text-base leading-snug">{conference.title}</h4>
        <MetaRow className="mt-2" items={[conference.dates, conference.location, conference.mode]} />
      </Card>
    );
  }

  return (
    <Card as="li" className="p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={conference.status === "Call for Papers" ? "saffron" : "leaf"}>
          {conference.status}
        </Tag>
        <Tag>{conference.mode}</Tag>
      </div>
      <h3 className="mt-4 text-xl leading-snug">{conference.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{conference.host}</p>
      <div className="mt-5 grid gap-4 border-t border-rule pt-4 sm:grid-cols-3">
        <div>
          <p className="eyebrow">Dates</p>
          <p className="mt-1.5 text-sm">{conference.dates}</p>
        </div>
        <div>
          <p className="eyebrow">Venue</p>
          <p className="mt-1.5 text-sm">{conference.location}</p>
        </div>
        <div>
          <p className="eyebrow">Submission deadline</p>
          <p className="mt-1.5 text-sm">{conference.deadline}</p>
        </div>
      </div>
      <MetaRow className="mt-4" items={[`Themes: ${conference.themes.join(", ")}`]} />
    </Card>
  );
}
