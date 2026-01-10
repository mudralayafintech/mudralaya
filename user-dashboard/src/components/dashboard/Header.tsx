"use client";

import React, { useEffect, useState } from "react";
import { Menu, Bell, HelpCircle, Search, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import styles from "./header.module.css";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data) {
            setProfile(data);
          }
        } catch (error) {
          console.error("Error fetching profile", error);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const displayName = profile?.full_name || "User";
  const displayRole = profile?.profession || "Member";
  const displayAvatar = profile?.avatar_url || "https://placehold.co/40"; // Fallback handled by onError in img

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.menuToggle} onClick={toggleSidebar}>
          <Menu className={styles.menuIcon} />
        </button>
        <h2 className={styles.title}>Dashboard</h2>
      </div>

      <div className={styles.headerCenter}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search...."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.headerRight}>
        <button className={`${styles.iconBtn}`}>
          <Bell size={20} />
          <span className={styles.notificationBadge}></span>
        </button>
        <button className={`${styles.iconBtn}`} title="Help">
          <HelpCircle size={20} />
        </button>

        <Link href="/dashboard/profile" className={styles.userProfileLink}>
          <div className={styles.userProfile}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {loading ? "..." : displayName}
              </span>
              <span className={styles.userRole}>{displayRole}</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayAvatar}
              alt={displayName}
              className={styles.userImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://placehold.co/40";
              }}
            />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
