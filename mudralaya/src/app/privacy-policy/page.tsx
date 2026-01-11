import PrivacyPolicy from "@/components/PrivacyPolicy/PrivacyPolicy";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy - Mudralaya",
    description: "Read our Privacy Policy to understand how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
    return <PrivacyPolicy />;
}
