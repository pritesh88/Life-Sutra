import type { Metadata } from "next";
import { IBM_Plex_Mono, Karla, Spectral } from "next/font/google";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { FOUNDATION } from "@/data/foundation";
import { getSiteUrl } from "@/lib/site";
import "@/styles.css";

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-spectral",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-karla",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${FOUNDATION.name} — ${FOUNDATION.tagline}`,
    template: `%s — ${FOUNDATION.name}`,
  },
  description: FOUNDATION.summary,
  // I Smart Life Foundation icon; the Life Sutra Synthesis pages override this
  // with the journal's own icon in (journal)/layout.tsx.
  icons: {
    icon: [
      { url: "/islf/favicon.svg", type: "image/svg+xml" },
      { url: "/islf/favicon.png", type: "image/png", sizes: "64x64" },
      { url: "/islf/favicon.ico", sizes: "any" },
    ],
    apple: "/islf/apple-touch-icon.png",
  },
  openGraph: {
    siteName: FOUNDATION.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${spectral.variable} ${karla.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased">
        {/* Each route group — (foundation), (journal), (life-sutra) — supplies its own chrome. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
