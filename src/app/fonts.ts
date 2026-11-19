import { Playfair_Display, Source_Serif_4 } from "next/font/google";

// Newspaper type for the home page front page
export const display = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const serif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});
