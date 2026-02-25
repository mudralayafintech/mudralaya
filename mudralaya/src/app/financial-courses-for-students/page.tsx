import type { Metadata } from "next";
import FinancialCourses from "@/components/FinancialCourses/FinancialCourses";

export const metadata: Metadata = {
  title: "Financial Courses for Students | Best Financial Courses for Students Online – Mudralaya",
  description:
    "Master money skills before life throws real bills at you. Practical, beginner-friendly financial courses for students in India. 100% online, self-paced, affordable. Start free today.",
  keywords: [
    "financial courses for students",
    "best financial courses for students online",
    "financial literacy for students India",
    "money management for college students",
    "personal finance course India",
  ],
  openGraph: {
    title: "Financial Courses for Students – Master Money Skills | Mudralaya",
    description:
      "Practical, beginner-friendly online financial courses designed for young learners in India. Self-paced, mobile-friendly, and affordable.",
    url: "https://www.mudralaya.com/financial-courses-for-students/",
    siteName: "Mudralaya",
    type: "website",
  },
};

export default function FinancialCoursesPage() {
  return <FinancialCourses />;
}
