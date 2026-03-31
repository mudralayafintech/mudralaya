import type { Metadata } from "next";
import WomenEmpowerment from "@/components/WomenEmpowerment/WomenEmpowerment";

export const metadata: Metadata = {
  title: "Women Empowerment and Financial Growth | Financial Independence Programs",
  description:
    "Women Empowerment and Financial Growth create a foundation for leadership, wealth creation, and long-term stability. Discover how Women Empowerment and Financial Growth opens doors to entrepreneurship, financial literacy, and sustainable growth for women worldwide.",
  keywords: [
    "women empowerment",
    "women financial growth",
    "women entrepreneurship",
    "women financial independence",
    "women financial education India",
    "women economic empowerment",
    "financial literacy for women",
  ],
  openGraph: {
    title: "Women Empowerment and Financial Growth – Build Your Legacy | Mudralaya",
    description:
      "Transform your financial future. Mudralaya provides comprehensive programs for women's empowerment through financial education, investment guidance, and entrepreneurial support.",
    url: "https://www.mudralaya.com/women-empowerment-and-financial-growth/",
    siteName: "Mudralaya",
    type: "website",
  },
};

export default function WomenEmpowermentPage() {
  return <WomenEmpowerment />;
}
