import type { Metadata } from "next";
import FinancialEntrepreneurship from "@/components/FinancialEntrepreneurship/FinancialEntrepreneurship";

export const metadata: Metadata = {
  title: "Financial Entrepreneurship Platform | Launch & Grow with a Financial Entrepreneurship Platform",
  description:
    "Discover a powerful financial entrepreneurship platform designed to help aspiring entrepreneurs build, manage, and scale finance-driven ventures. Join a trusted financial entrepreneurship platform and accelerate your business growth today.",
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
