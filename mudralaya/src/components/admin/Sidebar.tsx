"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  UserPlus,
  Users,
  Mail,
  Briefcase,
  CheckSquare,
  LogOut,
  Shield,
  Building2,
  FileText,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import clsx from "clsx";

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  onLogout?: () => void;
}

const navItems = [
  { id: "overview", path: "/admin/dashboard", icon: BarChart3, label: "Overview", perm: "dashboard" },
  { id: "users", path: "/admin/dashboard/users", icon: Users, label: "Registered Users", perm: "users" },
  { id: "join", path: "/admin/dashboard/join", icon: UserPlus, label: "Join Requests", perm: "join_requests" },
  { id: "contacts", path: "/admin/dashboard/contacts", icon: Mail, label: "Messages", perm: "contacts" },
  { id: "advisor", path: "/admin/dashboard/advisor", icon: Briefcase, label: "Advisors", perm: "advisors" },
  { id: "tasks", path: "/admin/dashboard/tasks", icon: CheckSquare, label: "Task Manager", perm: "tasks" },
  { id: "kyc", path: "/admin/dashboard/kyc", icon: FileText, label: "KYC Requests", perm: "kyc" },
  { id: "blogs", path: "/admin/dashboard/blogs", icon: BarChart3, label: "Blogs", perm: "blogs" },
  { id: "companies", path: "/admin/dashboard/companies", icon: Building2, label: "Companies", perm: "companies" },
  { id: "roles", path: "/admin/dashboard/roles", icon: Shield, label: "Roles & Access", perm: "roles" },
];

// Permission map: which permissions each role has (fallback if localStorage doesn't have it)
const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  super_admin: ['dashboard', 'users', 'roles', 'tasks', 'blogs', 'kyc', 'contacts', 'join_requests', 'advisors', 'companies', 'settings', 'reports'],
  admin: ['dashboard', 'users', 'tasks', 'blogs', 'kyc', 'contacts', 'join_requests', 'advisors', 'companies', 'reports'],
  seo: ['dashboard', 'blogs'],
  sales: ['dashboard', 'contacts', 'join_requests', 'companies', 'reports'],
  marketing_manager: ['dashboard', 'blogs', 'contacts', 'advisors', 'reports'],
  blogger: ['blogs'],
};

export default function Sidebar({
  isMobileOpen,
  toggleMobileSidebar,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = React.useState<string>("super_admin");
  const [username, setUsername] = React.useState<string>("Super Admin");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("adminRole") || "super_admin");
      setUsername(localStorage.getItem("adminUsername") || "Super Admin");
    }
  }, []);

  // Filter nav items based on RBAC permissions
  const userPerms = ROLE_PERMISSION_MAP[role] || ROLE_PERMISSION_MAP['super_admin'];
  const visibleNavItems = navItems.filter((item) => {
    // Super admin sees everything
    if (role === 'super_admin') return true;
    // Others only see items they have permission for
    return userPerms.includes(item.perm);
  });

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
            {visibleNavItems.map((item) => {
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
            <div className={styles.avatar}>{username.charAt(0).toUpperCase()}</div>
            <div className={styles.info}>
              <span className={styles.name}>{username}</span>
              <span className={styles.role}>
                {role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
