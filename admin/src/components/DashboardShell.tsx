"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import styles from "./DashboardShell.module.css";
import { Menu } from "lucide-react";
import TopHeader from "./TopHeader";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.includes("/dashboard/join")) return "Join Requests";
    if (path.includes("/dashboard/contacts")) return "Messages";
    if (path.includes("/dashboard/advisor")) return "Advisors";
    if (path.includes("/dashboard/tasks")) return "Task Manager";
    if (path.includes("/dashboard/kyc")) return "KYC Requests";
    if (path.includes("/dashboard/clients")) return "Clients";
    return "Overview";
  };

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout error:", e);
    }

    // 1. Clear sensitive data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("admin-storage");

    // 2. Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 3. Hard redirect to login to ensure clean state
    window.location.href = "/login";
  };

  return (
    <div className={styles.layout}>
      <Sidebar
        isMobileOpen={isMobileOpen}
        toggleMobileSidebar={toggleMobileSidebar}
        onLogout={handleLogout}
      />

      <main className={styles.main}>
        <div className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={toggleMobileSidebar}>
            <Menu size={24} />
          </button>
          <span className={styles.mobileBrand}>{getPageTitle(pathname)}</span>
        </div>

        <TopHeader />

        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
