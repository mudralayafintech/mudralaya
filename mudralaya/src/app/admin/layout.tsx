"use client";

import { usePathname } from "next/navigation";
import DashboardShell from "@/components/admin/DashboardShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Admin login page should NOT be wrapped in DashboardShell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
