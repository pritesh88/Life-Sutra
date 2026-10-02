import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Page frame shared by the foundation and Life Sutra, so both publications
 * sit on the same 12-column grid. The journal keeps its own Container.
 */
export function Wrap({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[78rem] px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}
