"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  HelpCircle,
  FileText,
  Loader2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";
import styles from "./settings.module.css";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const supabase = createClient();

  // Account form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);

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
        if (profile) {
          setFullName(profile.full_name || "");
          setEmail(profile.email_id || "");
        }
      }
      setLoading(false);
    };
    fetchUser();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveLoading(true);
    setSaveStatus(null);
    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: fullName.trim(), email_id: email.trim() })
        .eq("id", user.id);
      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, full_name: fullName.trim(), email_id: email.trim() }));
      setSaveStatus("success");
    } catch {
      setSaveStatus("error");
    } finally {
      setSaveLoading(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div>
            <h2 className={styles.settingsSectionTitle}>Account Settings</h2>
            <form className={styles.settingsForm} onSubmit={handleSaveAccount}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              {saveStatus === "success" && (
                <div style={{ color: "#059669", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", background: "#ecfdf5", padding: "10px 14px", borderRadius: "8px" }}>
                  <Check size={16} /> Profile updated successfully!
                </div>
              )}
              {saveStatus === "error" && (
                <div style={{ color: "#dc2626", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", background: "#fef2f2", padding: "10px 14px", borderRadius: "8px" }}>
                  <X size={16} /> Failed to save. Please try again.
                </div>
              )}
              <button className={styles.saveBtn} disabled={saveLoading}>
                {saveLoading ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
              </button>
            </form>
          </div>
        );
      case "security":
        return (
          <div>
            <h2 className={styles.settingsSectionTitle}>Security</h2>
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: "12px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#0369a1" }}>
                <Lock size={20} />
                <span style={{ fontWeight: 600, fontSize: "15px" }}>OTP-Based Authentication</span>
              </div>
              <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: 1.6 }}>
                Your account is secured using phone-based OTP login. No password is
                required — your phone number serves as your identity.
              </p>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                To change your phone number, please contact support.
              </p>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2 className={styles.settingsSectionTitle}>Notifications</h2>
              {notifications.some((n) => !n.is_read) && (
                <button
                  onClick={markAllRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#4F46E5",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notificationLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "40px",
                }}
              >
                <Loader2
                  size={24}
                  className="animate-spin"
                  style={{ color: "#4F46E5" }}
                />
              </div>
            ) : notifications.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {notifications.map((notif) => {
                  const getIcon = () => {
                    switch (notif.type) {
                      case "success":
                      case "task":
                        return <Check size={18} />;
                      case "error":
                        return <X size={18} />;
                      case "warning":
                        return <AlertCircle size={18} />;
                      default:
                        return <Bell size={18} />;
                    }
                  };

                  const getIconBg = () => {
                    switch (notif.type) {
                      case "success":
                      case "task":
                        return "#10b981";
                      case "error":
                        return "#ef4444";
                      case "warning":
                        return "#f59e0b";
                      default:
                        return "#6366f1";
                    }
                  };

                  return (
                    <div
                      key={notif.id}
                      onClick={() => !notif.is_read && markAsRead(notif.id)}
                      style={{
                        display: "flex",
                        gap: "16px",
                        padding: "16px",
                        background: notif.is_read ? "#fff" : "#f0f9ff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        cursor: notif.is_read ? "default" : "pointer",
                        transition: "all 0.2s",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: getIconBg(),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#fff",
                        }}
                      >
                        {getIcon()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "14px",
                            fontWeight: notif.is_read ? "500" : "700",
                            color: "#1e293b",
                          }}
                        >
                          {notif.title}
                        </h4>
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "13px",
                            color: "#64748b",
                            lineHeight: "1.5",
                          }}
                        >
                          {notif.message}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#94a3b8",
                          }}
                        >
                          {new Date(notif.created_at).toLocaleDateString(
                            "en-US",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#4F46E5",
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={clearAllNotifications}
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    background: "#fee2e2",
                    border: "none",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Clear All Notifications
                </button>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#94a3b8",
                }}
              >
                <Bell
                  size={48}
                  style={{ marginBottom: "16px", opacity: 0.3 }}
                />
                <p style={{ fontSize: "16px", margin: 0 }}>
                  No new notifications
                </p>
              </div>
            )}
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
            className={`${styles.settingsTab} ${activeTab === "account" ? styles.active : ""
              }`}
            onClick={() => setActiveTab("account")}
          >
            <User size={18} /> Account
          </button>
          <button
            className={`${styles.settingsTab} ${activeTab === "security" ? styles.active : ""
              }`}
            onClick={() => setActiveTab("security")}
          >
            <Lock size={18} /> Security
          </button>
          <button
            className={`${styles.settingsTab} ${activeTab === "notifications" ? styles.active : ""
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
