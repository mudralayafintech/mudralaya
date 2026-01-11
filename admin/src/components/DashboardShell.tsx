"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import styles from "./DashboardShell.module.css";
import { Menu } from "lucide-react";
import TopHeader from "./TopHeader";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  const handleLogout = () => {
    // 1. Clear sensitive data
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("admin-storage");

    // 2. Clear cookies if any (just in case Supabase helpers set them)
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
          <span className={styles.mobileBrand}>Mudralaya Admin</span>
        </div>

        <TopHeader />

        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
