"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  List,
  Wallet,
  LogOut,
} from "lucide-react";
import styles from "./sidebar.module.css";
import Image from "next/image";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    // 1. Instant navigation to avoid delay
    router.push("/login");

    // 2. Perform sign out in background
    await supabase.auth.signOut();

    // 3. Refresh to ensure state is cleared everywhere
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Task", path: "/dashboard/tasks", icon: ClipboardList },
    { name: "Membership", path: "/dashboard/membership", icon: CreditCard },
    { name: "Plans", path: "/dashboard/plans", icon: List },
    { name: "Wallet", path: "/dashboard/wallet", icon: Wallet },
  ];

  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <Image
            src="/mudralaya_logo.webp"
            alt="Mudralaya"
            width={200}
            height={60}
            className={styles.sidebarLogo}
            priority
          />
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navSection}>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${styles.navItem} ${isActive ? styles.active : ""
                    }`}
                  onClick={() => {
                    if (window.innerWidth <= 768) {
                      toggleSidebar();
                    }
                  }}
                >
                  <item.icon className={styles.navIcon} size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className={`${styles.navSection} ${styles.logoutSection}`}>
            <button
              className={`${styles.navItem} ${styles.logoutBtn}`}
              onClick={handleLogout}
            >
              <LogOut className={styles.navIcon} size={20} />
              <span>Log out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {/* Mobile Overlay */}
      {isOpen && (
        <div className={styles.mobileOverlay} onClick={toggleSidebar} />
      )}
    </>
  );
};

export default Sidebar;
