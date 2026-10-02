import { Cormorant_Garamond, Newsreader, Public_Sans } from "next/font/google";

/**
 * Fonts for the publisher site and the Life Sutra imprint. The journal's own
 * fonts (Spectral, Karla, IBM Plex Mono) are loaded in the root layout.
 * Import these only from the layouts that use them so they preload there alone.
 */
export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
