import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google"; // Optimized fonts
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto"
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat"
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
      <body className={`${roboto.variable} ${montserrat.variable} antialiased`}>
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
