import type { Metadata } from "next";
import { IBM_Plex_Mono, Karla, Spectral } from "next/font/google";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, getSiteUrl } from "@/lib/site";
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
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    siteName: SITE_NAME,
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
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  );
}
