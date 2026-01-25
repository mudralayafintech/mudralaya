"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  UserPlus,
  Mail,
  Briefcase,
  CheckSquare,
  LogOut,
  Users,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import clsx from "clsx";

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  onLogout?: () => void;
}

const navItems = [
  { id: "overview", path: "/dashboard", icon: BarChart3, label: "Overview" },
  {
    id: "join",
    path: "/dashboard/join",
    icon: UserPlus,
    label: "Join Requests",
  },
  {
    id: "contacts",
    path: "/dashboard/contacts",
    icon: Mail,
    label: "Messages",
  },
  {
    id: "advisor",
    path: "/dashboard/advisor",
    icon: Briefcase,
    label: "Advisors",
  },
  {
    id: "tasks",
    path: "/dashboard/tasks",
    icon: CheckSquare,
    label: "Task Manager",
  },
  {
    id: "kyc",
    path: "/dashboard/kyc",
    icon: CheckSquare, // Using CheckSquare or similar, Sidebar.tsx imports CheckSquare (already used for tasks? Let's check imports)
    label: "KYC Requests",
  },
];

export default function Sidebar({
  isMobileOpen,
  toggleMobileSidebar,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={clsx(styles.mobileOverlay, isMobileOpen && styles.active)}
        onClick={toggleMobileSidebar}
      />

      <aside
        className={clsx(styles.sidebar, isMobileOpen && styles.mobileOpen)}
      >
        <div className={styles.header}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mudralya_logo.webp"
            alt="Mudralaya"
            className={styles.logo}
          />
          <span className={styles.brand}>Admin Panel</span>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={clsx(styles.navLink, isActive && styles.active)}
                    onClick={() => {
                      if (window.innerWidth < 992) toggleMobileSidebar();
                    }}
                  >
                    <item.icon className={styles.navIcon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.footer}>
          <button
            className={clsx(styles.navLink, styles.logoutBtn)}
            onClick={onLogout}
          >
            <LogOut className={styles.navIcon} />
            <span>Logout</span>
          </button>
          <div className={styles.profile}>
            <div className={styles.avatar}>A</div>
            <div className={styles.info}>
              <span className={styles.name}>Admin User</span>
              <span className={styles.role}>Super Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
