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

  return (
    <div className={styles.layout}>
      <Sidebar
        isMobileOpen={isMobileOpen}
        toggleMobileSidebar={toggleMobileSidebar}
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
