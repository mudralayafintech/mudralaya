"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Bell, HelpCircle, FileText, Loader2 } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";
import styles from "./settings.module.css";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div>
            <h2 className={styles.settingsSectionTitle}>Account Settings</h2>
            <form
              className={styles.settingsForm}
              onSubmit={(e) => e.preventDefault()}
            >
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  defaultValue={profile?.full_name || ""}
                  placeholder="Your Name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  defaultValue={profile?.email_id || ""}
                  placeholder="email@example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  defaultValue={profile?.mobile_number || user?.phone || ""}
                  readOnly
                  disabled
                  style={{ opacity: 0.7, cursor: "not-allowed" }}
                />
                <small className="text-muted">
                  Phone number cannot be changed here.
                </small>
              </div>
              <button className={styles.saveBtn}>Save Changes</button>
            </form>
          </div>
        );
      case "security":
        return (
          <div>
            <h2 className={styles.settingsSectionTitle}>Security</h2>
            <form
              className={styles.settingsForm}
              onSubmit={(e) => e.preventDefault()}
            >
              <div className={styles.formGroup}>
                <label>Current Password</label>
                <input type="password" />
              </div>
              <div className={styles.formGroup}>
                <label>New Password</label>
                <input type="password" />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <input type="password" />
              </div>
              <button className={styles.saveBtn}>Update Password</button>
            </form>
          </div>
        );
      case "notifications":
        return (
          <div>
            <h2 className={styles.settingsSectionTitle}>Notifications</h2>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <h4>Email Notifications</h4>
                <p>Receive emails about your account activity.</p>
              </div>
              <div className={`${styles.toggleSwitch} ${styles.on}`}>
                <div className={styles.toggleHandle}></div>
              </div>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <h4>Task Updates</h4>
                <p>Get notified when a task is approved.</p>
              </div>
              <div className={`${styles.toggleSwitch} ${styles.on}`}>
                <div className={styles.toggleHandle}></div>
              </div>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <h4>Promotional Offers</h4>
                <p>Receive updates about new plans and offers.</p>
              </div>
              <div className={styles.toggleSwitch}>
                <div className={styles.toggleHandle}></div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a setting</div>;
    }
  };

  if (loading)
    return (
      <div className={styles.settingsPage}>
        <header className={styles.settingsHeader}>
          <Skeleton width={150} height={32} style={{ marginBottom: 8 }} />
          <Skeleton width={300} height={16} />
        </header>

        <div className={styles.settingsContainer}>
          {/* Sidebar Skeleton */}
          <div className={styles.settingsSidebar}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                width="100%"
                height={48}
                borderRadius={12}
                style={{ marginBottom: 8 }}
              />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className={styles.settingsContent}>
            <Skeleton width={200} height={28} style={{ marginBottom: 30 }} />
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <Skeleton width={100} height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={48} borderRadius={12} />
              </div>
            ))}
            <Skeleton
              width={120}
              height={40}
              borderRadius={12}
              style={{ marginTop: 20 }}
            />
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.settingsPage}>
      <header className={styles.settingsHeader}>
        <h1>Settings</h1>
        <p>Manage your account preferences and settings.</p>
      </header>

      <div className={styles.settingsContainer}>
        <div className={styles.settingsSidebar}>
          <button
            className={`${styles.settingsTab} ${
              activeTab === "account" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("account")}
          >
            <User size={18} /> Account
          </button>
          <button
            className={`${styles.settingsTab} ${
              activeTab === "security" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            <Lock size={18} /> Security
          </button>
          <button
            className={`${styles.settingsTab} ${
              activeTab === "notifications" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={18} /> Notifications
          </button>
          <button className={styles.settingsTab}>
            <FileText size={18} /> Terms of Service
          </button>
          <button className={styles.settingsTab}>
            <HelpCircle size={18} /> Help & Support
          </button>
        </div>
        <div className={styles.settingsContent}>{renderContent()}</div>
      </div>
    </div>
  );
}
