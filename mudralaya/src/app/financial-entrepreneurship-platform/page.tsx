import type { Metadata } from "next";
import FinancialEntrepreneurship from "@/components/FinancialEntrepreneurship/FinancialEntrepreneurship";

export const metadata: Metadata = {
  title: "Financial Entrepreneurship Platform | Launch & Grow with a Financial Entrepreneurship Platform – Mudralaya",
  description:
    "Turn your ideas into profitable ventures with smart finance at the core. Mudralaya's financial entrepreneurship platform provides integrated tools, funding guidance, growth analytics, and mentorship for Indian entrepreneurs.",
  keywords: [
    "financial entrepreneurship platform",
    "entrepreneurship platform India",
    "startup finance tools India",
    "business growth platform",
    "financial tools for entrepreneurs",
  ],
  openGraph: {
    title: "Financial Entrepreneurship Platform – Launch & Grow | Mudralaya",
    description:
      "Launch, manage, and grow finance-driven ventures confidently. Integrated financial tools, funding guidance, and mentorship for Indian entrepreneurs.",
    url: "https://www.mudralaya.com/financial-entrepreneurship-platform/",
    siteName: "Mudralaya",
    type: "website",
  },
};

export default function FinancialEntrepreneurshipPage() {
  return <FinancialEntrepreneurship />;
}
