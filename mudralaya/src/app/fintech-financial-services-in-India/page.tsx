import type { Metadata } from "next";
import FintechServices from "@/components/FintechServices/FintechServices";

export const metadata: Metadata = {
  title: "Fintech Financial Services in India | Fintech Investment in India Opportunities",
  description:
    "Explore the growth of fintech financial services in India and discover emerging opportunities in fintech investment in india. Learn how innovation, digital payments, and smart funding models are transforming the Indian financial ecosystem.",
  keywords: [
    "fintech financial services in India",
    "fintech investment in India",
    "digital payments India",
    "fintech startup India",
    "UPI fintech India",
    "insurtech wealthtech India",
  ],
  openGraph: {
    title: "Fintech Financial Services in India – Innovation Meets Everyday Money | Mudralaya",
    description:
      "From UPI to wealthtech, fintech financial services in India are creating inclusive, efficient financial access for everyone. Explore investment opportunities and key growth drivers.",
    url: "https://www.mudralaya.com/fintech-financial-services-in-India/",
    siteName: "Mudralaya",
    type: "website",
  },
};

export default function FintechServicesPage() {
  return <FintechServices />;
}
