import type { Metadata } from "next";
import { Inter, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: "Kollimalai Arasan",
  description: "Kollimalai Arasan - Quality you can taste.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${inter.variable} ${hanken.variable}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
