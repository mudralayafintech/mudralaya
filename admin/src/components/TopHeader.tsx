"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Settings } from "lucide-react";
import styles from "./TopHeader.module.css";

const getPageTitle = (pathname: string) => {
  if (pathname.includes("/dashboard/join")) return "Join Requests";
  if (pathname.includes("/dashboard/contacts")) return "Messages";
  if (pathname.includes("/dashboard/advisor")) return "Advisor Apps";
  if (pathname.includes("/dashboard/tasks")) return "Task Manager";
  return "Overview";
};

export default function TopHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <span className={styles.breadcrumbs}>{date}</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn} title="Search">
          <Search size={18} />
        </button>
        <button className={styles.iconBtn} title="Notifications">
          <Bell size={18} />
        </button>

        <div className={styles.profile}>
          <div className={styles.avatar}>A</div>
          <div className={styles.adminInfo}>
            <span className={styles.adminName}>Admin User</span>
            <span className={styles.adminRole}>Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
