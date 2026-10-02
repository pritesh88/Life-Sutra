import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ImprintFooter, ImprintHeader } from "@/components/imprint/ImprintChrome";
import { cormorant, newsreader, publicSans } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Life Sutra — Book Publication", template: "%s — Life Sutra" },
};

/** Life Sutra — the book imprint's own chrome and theme. */
export default function ImprintLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`theme-imprint flex min-h-screen flex-col ${cormorant.variable} ${newsreader.variable} ${publicSans.variable}`}
    >
      <ImprintHeader />
      <main className="flex-1">{children}</main>
      <ImprintFooter />
    </div>
  );
}
