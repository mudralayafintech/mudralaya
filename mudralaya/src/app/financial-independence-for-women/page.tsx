import type { Metadata } from "next";
import FinancialWomen from "@/components/FinancialWomen/FinancialWomen";

export const metadata: Metadata = {
  title: "Financial Independence for Women | Women and Financial Independence Guide",
  description:
    "Financial independence for women begins with informed decisions, confident investing, and sustainable income strategies. Explore how women and financial independence create lasting security, leadership, and generational wealth.",
  keywords: [
    "financial independence for women",
    "women and financial independence",
    "financial freedom for women India",
    "women investing India",
    "financial literacy for women",
  ],
  openGraph: {
    title: "Financial Independence for Women – Your Money, Your Power | Mudralaya",
    description:
      "True freedom starts with financial control in your own hands. Practical guide on achieving financial independence for women in India.",
    url: "https://www.mudralaya.com/financial-independence-for-women/",
    siteName: "Mudralaya",
    type: "website",
  },
};

export default function FinancialIndependenceWomenPage() {
  return <FinancialWomen />;
}
