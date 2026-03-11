import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google"; // Optimized fonts
import "./globals.css";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import OrganizationSchema from "@/components/OrganizationSchema";
import WebsiteSchema from "@/components/WebsiteSchema";

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
  title: "Grow Big with Mudralaya | Mudralaya Financial Services | Start Your Career in Mudralaya",
  description:
    "Grow big with Mudralaya and explore rewarding opportunities at Mudralaya Financial Services. Start your career in Mudralaya today and build a strong future with professional growth and success.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <LocalBusinessSchema />
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
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
