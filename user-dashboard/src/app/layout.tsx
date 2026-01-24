import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Courier New", "monospace"],
});

export const metadata: Metadata = {
  title: "Mudralaya Dashboard - Your Financial Gateway",
  description: "Manage your tasks, earnings, and wallet on Mudralaya. Track your financial progress and complete tasks to earn rewards.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Mudralaya Dashboard - Your Financial Gateway",
    description: "Manage your tasks, earnings, and wallet on Mudralaya. Track your financial progress and complete tasks to earn rewards.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mudralaya Dashboard - Your Financial Gateway",
    description: "Manage your tasks, earnings, and wallet on Mudralaya.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
