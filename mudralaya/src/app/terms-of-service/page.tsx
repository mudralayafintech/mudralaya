import TermsOfService from "@/components/TermsOfService/TermsOfService";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service - Mudralaya",
    description: "Read our Terms of Service to understand the rules and regulations for using the Mudralaya platform.",
};

export default function TermsOfServicePage() {
    return <TermsOfService />;
}
