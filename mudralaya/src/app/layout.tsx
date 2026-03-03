import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // Optimized fonts
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Preconnect } from "@/components/Preconnect";

export const metadata: Metadata = {
  title: "Mudralaya - Your Financial Gateway",
  description:
    "Experience premium financial services with Mudralaya. Modern, secure, and user-friendly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <UIProvider>
            <Preconnect />
            <Header />
            <LayoutWrapper>
              <main style={{ minHeight: "100vh" }}>{children}</main>
            </LayoutWrapper>
            <Footer />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
