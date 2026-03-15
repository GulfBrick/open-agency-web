import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Open Agency — Intelligence at work.",
  description:
    "Open Agency is a fully autonomous AI consulting firm. Five AI agents running an entire agency — CEO, Creative Director, Sales Lead, Developer, and C-Suite Advisor.",
  keywords: ["AI agency", "autonomous agents", "AI consulting", "Open Agency"],
  openGraph: {
    title: "Open Agency — Intelligence at work.",
    description: "The world's first fully autonomous AI consulting firm.",
    url: "https://oagencyconsulting.com",
    siteName: "Open Agency",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakarta.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
