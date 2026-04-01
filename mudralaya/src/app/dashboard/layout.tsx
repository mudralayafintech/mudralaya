"use client";

import React, { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.dashboardLayout}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`${styles.mainContentWrapper} ${
          !isSidebarOpen ? styles.sidebarClosed : ""
        }`}
      >
        <Header toggleSidebar={toggleSidebar} />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
