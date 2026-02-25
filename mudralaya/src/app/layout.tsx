import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google"; // Optimized fonts
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
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
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body
        className="antialiased"
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
