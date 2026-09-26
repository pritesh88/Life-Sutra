import { Clock } from "lucide-react";
import { Card, Tag } from "@/components/site/primitives";

export function ComingSoon({
  title = "In preparation",
  purpose,
}: {
  title?: string;
  purpose: string[];
}) {
  return (
    <Card className="mx-auto max-w-2xl items-center p-8 text-center sm:p-10">
      <Tag tone="gold">
        <Clock className="mr-1.5 size-3" aria-hidden="true" />
        Coming soon
      </Tag>
      <h3 className="mt-4 text-xl leading-snug">{title}</h3>
      <ul className="mt-5 grid gap-3 text-left">
        {purpose.map((line) => (
          <li key={line} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>
    </Card>
  );
}
