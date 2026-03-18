import type { Metadata } from "next";
import FinancialCourses from "@/components/FinancialCourses/FinancialCourses";

export const metadata: Metadata = {
  title: "Financial Courses for Students | Best Financial Courses for Students Online",
  description:
    "Explore top financial courses for students designed to build strong money management, investment, and career-ready skills. Discover beginner to advanced financial courses for students and start learning today.",
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
