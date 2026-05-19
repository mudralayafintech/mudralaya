"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import styles from "./DashboardShell.module.css";
import { Menu } from "lucide-react";
import TopHeader from "./TopHeader";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.includes("/admin/dashboard/join")) return "Join Requests";
    if (path.includes("/admin/dashboard/contacts")) return "Messages";
    if (path.includes("/admin/dashboard/advisor")) return "Advisors";
    if (path.includes("/admin/dashboard/tasks")) return "Task Manager";
    if (path.includes("/admin/dashboard/kyc")) return "KYC Requests";
    if (path.includes("/admin/dashboard/blogs")) return "Blogs";
    if (path.includes("/admin/dashboard/clients")) return "Clients";
    if (path.includes("/admin/dashboard/companies")) return "Companies";
    if (path.includes("/admin/dashboard/users")) return "Registered Users";
    if (path.includes("/admin/dashboard/roles")) return "Roles & Access";
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
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("admin-storage");

    // 2. Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 3. Hard redirect to admin login
    window.location.href = "/admin/login";
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
