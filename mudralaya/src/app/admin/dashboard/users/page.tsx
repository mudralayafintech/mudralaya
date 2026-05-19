"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApiRequest } from "@/lib/adminApi";
import { Users, Search, UserCheck, MapPin, Briefcase, CreditCard } from "lucide-react";
import styles from "./users.module.css";

interface RegisteredUser {
  id: string;
  full_name: string | null;
  phone: string | null;
  email_id: string | null;
  mobile_number: string | null;
  role: string | null;
  profession: string | null;
  plan: string | null;
  plan_type: string | null;
  membership_type: string | null;
  membership_expiry: string | null;
  membership_start_date: string | null;
  city: string | null;
  has_laptop: boolean | null;
  created_at: string;
  updated_at: string | null;
}

export default function RegisteredUsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const pageSize = 25;

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApiRequest("get-registered-users", {
        page,
        pageSize,
        search: debouncedSearch,
      });
      setUsers(res.users || []);
      setTotal(res.total || 0);
      setTotalAll(res.totalAll || 0);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getAvatarColor = (name: string | null) => {
    if (!name) return "#94a3b8";
    const colors = [
      "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
      "#10b981", "#06b6d4", "#ef4444", "#6366f1",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // Stats
  const paidUsers = users.filter(u => u.plan && u.plan !== "free" && u.plan !== "none").length;
  const totalPages = Math.ceil(total / pageSize);

  if (loading && users.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Loading registered users...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#eff6ff" }}>
            <Users size={22} color="#3b82f6" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{totalAll}</span>
            <span className={styles.statLabel}>Total Users</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#f0fdf4" }}>
            <UserCheck size={22} color="#16a34a" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{paidUsers}</span>
            <span className={styles.statLabel}>Active Members</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#fef3c7" }}>
            <CreditCard size={22} color="#d97706" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {users.filter(u => u.plan_type).map(u => u.plan_type).filter((v, i, a) => a.indexOf(v) === i).length}
            </span>
            <span className={styles.statLabel}>Plan Types</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: "#fae8ff" }}>
            <MapPin size={22} color="#a855f7" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {users.filter(u => u.city).map(u => u.city).filter((v, i, a) => a.indexOf(v) === i).length}
            </span>
            <span className={styles.statLabel}>Cities</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name, phone, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className={styles.resultCount}>
          Showing {users.length} of {total} users
        </span>
      </div>

      {/* Table */}
      {users.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} />
          <h3>No users found</h3>
          <p>{debouncedSearch ? "Try a different search term" : "No registered users yet"}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Profession</th>
                <th>Plan</th>
                <th>City</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div
                        className={styles.userAvatar}
                        style={{ background: getAvatarColor(user.full_name) }}
                      >
                        {(user.full_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.userName}>
                          {user.full_name || "—"}
                        </div>
                        <div className={styles.userPhone}>
                          {user.role || "user"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.dateText}>
                    {user.mobile_number || user.phone || "—"}
                  </td>
                  <td className={styles.dateText}>
                    {user.email_id || "—"}
                  </td>
                  <td>
                    {user.profession ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "#475569" }}>
                        <Briefcase size={12} />
                        {user.profession}
                      </span>
                    ) : (
                      <span className={styles.dateText}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.planBadge} ${user.plan && user.plan !== "free" && user.plan !== "none" ? styles.planPaid : styles.planFree}`}>
                      {user.plan_type || user.plan || "Free"}
                    </span>
                  </td>
                  <td className={styles.cityText}>
                    {user.city || "—"}
                  </td>
                  <td className={styles.dateText}>
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <div className={styles.pageButtons}>
                <button
                  className={styles.pageBtn}
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <button
                  className={styles.pageBtn}
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
