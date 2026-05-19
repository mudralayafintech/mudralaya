"use client";

import React, { useState, useEffect, useCallback } from "react";
import { adminApiRequest } from "@/lib/adminApi";
import {
  Shield, Users, Plus, Pencil, Trash2, X,
  UserPlus, ShieldCheck, Eye, EyeOff,
} from "lucide-react";
import styles from "./roles.module.css";
import clsx from "clsx";

// ─── Types ───────────────────────────────────────────────

interface Role {
  id: string;
  label: string;
  description: string;
  permissions: string[];
  color: string;
  sort_order: number;
}

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  display_name: string | null;
  role: string;
  is_active: boolean;
  permissions: string[];
  last_login: string | null;
  created_at: string;
  updated_at: string | null;
}

const ALL_PERMISSIONS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "users", label: "User Management" },
  { id: "roles", label: "Role Management" },
  { id: "tasks", label: "Task Manager" },
  { id: "blogs", label: "Blog Manager" },
  { id: "kyc", label: "KYC Requests" },
  { id: "contacts", label: "Messages/Contacts" },
  { id: "join_requests", label: "Join Requests" },
  { id: "advisors", label: "Advisor Management" },
  { id: "companies", label: "Companies" },
  { id: "settings", label: "Settings" },
  { id: "reports", label: "Reports & Analytics" },
];

// ─── Component ───────────────────────────────────────────

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "users">("users");
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<null | "create" | "edit">(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    display_name: "",
    email: "",
    role: "admin",
    permissions: [] as string[],
    is_active: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rolesRes, usersRes] = await Promise.all([
        adminApiRequest("get-roles", {}),
        adminApiRequest("get-admin-users", {}),
      ]);
      setRoles(rolesRes || []);
      setUsers(usersRes || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Modal Helpers ──

  const openCreateModal = () => {
    setFormData({
      username: "",
      password: "",
      display_name: "",
      email: "",
      role: "admin",
      permissions: roles.find(r => r.id === "admin")?.permissions || [],
      is_active: true,
    });
    setSelectedUser(null);
    setModalMode("create");
    setShowPassword(false);
  };

  const openEditModal = (user: AdminUser) => {
    setFormData({
      username: user.username,
      password: "",
      display_name: user.display_name || "",
      email: user.email || "",
      role: user.role,
      permissions: user.permissions || [],
      is_active: user.is_active,
    });
    setSelectedUser(user);
    setModalMode("edit");
    setShowPassword(false);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleRoleChange = (newRole: string) => {
    const roleObj = roles.find(r => r.id === newRole);
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: roleObj?.permissions || prev.permissions,
    }));
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modalMode === "create") {
        await adminApiRequest("create-admin-user", {
          username: formData.username,
          password: formData.password,
          role: formData.role,
          email: formData.email || undefined,
          display_name: formData.display_name || undefined,
        });
      } else if (modalMode === "edit" && selectedUser) {
        const payload: Record<string, unknown> = {
          userId: selectedUser.id,
          role: formData.role,
          email: formData.email,
          display_name: formData.display_name,
          is_active: formData.is_active,
          permissions: formData.permissions,
        };
        if (formData.password) payload.password = formData.password;
        await adminApiRequest("update-admin-user", payload);
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) return;
    try {
      await adminApiRequest("delete-admin-user", { userId });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  // ── Role Helpers ──

  const getRoleColor = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.color || "#64748b";
  };

  const getRoleLabel = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.label || roleId;
  };

  const getUserCountForRole = (roleId: string) => {
    return users.filter(u => u.role === roleId).length;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── Render ──

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Loading roles & permissions...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Tabs */}
      <div className={styles.tabNav}>
        <button
          className={clsx(styles.tab, activeTab === "users" && styles.tabActive)}
          onClick={() => setActiveTab("users")}
        >
          <Users size={16} />
          Team Members
          <span className={styles.tabBadge}>{users.length}</span>
        </button>
        <button
          className={clsx(styles.tab, activeTab === "roles" && styles.tabActive)}
          onClick={() => setActiveTab("roles")}
        >
          <Shield size={16} />
          Roles & Permissions
          <span className={styles.tabBadge}>{roles.length}</span>
        </button>
      </div>

      {/* ═══ ROLES TAB ═══ */}
      {activeTab === "roles" && (
        <>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>System Roles</h2>
              <p className={styles.sectionSubtitle}>
                Each role defines what sections a team member can access
              </p>
            </div>
          </div>

          <div className={styles.rolesGrid}>
            {roles.map((role) => (
              <div key={role.id} className={styles.roleCard}>
                <div
                  className={styles.roleCardAccent}
                  style={{ background: `linear-gradient(90deg, ${role.color}, ${role.color}88)` }}
                />
                <div className={styles.roleHeader}>
                  <div className={styles.roleName}>
                    <ShieldCheck size={18} style={{ color: role.color }} />
                    {role.label}
                  </div>
                  <span
                    className={styles.roleBadge}
                    style={{ background: role.color }}
                  >
                    {role.id}
                  </span>
                </div>
                <p className={styles.roleDesc}>{role.description}</p>
                <div className={styles.permissionsList}>
                  {role.permissions.map((perm) => (
                    <span key={perm} className={styles.permTag}>
                      {ALL_PERMISSIONS.find(p => p.id === perm)?.label || perm}
                    </span>
                  ))}
                </div>
                <div className={styles.roleUserCount}>
                  <Users size={14} />
                  {getUserCountForRole(role.id)} team member{getUserCountForRole(role.id) !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═══ USERS TAB ═══ */}
      {activeTab === "users" && (
        <>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Team Members</h2>
              <p className={styles.sectionSubtitle}>
                Manage admin users and their access levels
              </p>
            </div>
            <button className={styles.addBtn} onClick={openCreateModal}>
              <UserPlus size={16} />
              Add Member
            </button>
          </div>

          {users.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={48} />
              <h3>No team members yet</h3>
              <p>Add your first team member to get started</p>
            </div>
          ) : (
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div
                          className={styles.userAvatar}
                          style={{ background: getRoleColor(user.role) }}
                        >
                          {(user.display_name || user.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.userName}>
                            {user.display_name || user.username}
                          </div>
                          <div className={styles.userUsername}>@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={styles.roleBadge}
                        style={{ background: getRoleColor(user.role) }}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td>
                      <span className={user.is_active ? styles.statusActive : styles.statusInactive}>
                        <span className={styles.statusDot} />
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          className={styles.iconBtn}
                          title="Edit"
                          onClick={() => openEditModal(user)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className={clsx(styles.iconBtn, styles.iconBtnDanger)}
                          title="Delete"
                          onClick={() => handleDelete(user.id, user.username)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ═══ CREATE / EDIT MODAL ═══ */}
      {modalMode && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalMode === "create" ? "Add Team Member" : `Edit ${selectedUser?.username}`}
              </h3>
              <button className={styles.modalClose} onClick={closeModal}>
                <X size={16} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Username *</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                  placeholder="e.g. john_doe"
                  disabled={modalMode === "edit"}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Display Name</label>
                <input
                  className={styles.formInput}
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData(p => ({ ...p, display_name: e.target.value }))}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email</label>
                <input
                  className={styles.formInput}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="john@mudralaya.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {modalMode === "create" ? "Password *" : "New Password (leave blank to keep current)"}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className={styles.formInput}
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role *</label>
                <select
                  className={styles.formSelect}
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              {modalMode === "edit" && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <select
                    className={styles.formSelect}
                    value={formData.is_active ? "active" : "inactive"}
                    onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.value === "active" }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Permissions</label>
                <div className={styles.permGrid}>
                  {ALL_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.id}
                      className={clsx(
                        styles.permCheckbox,
                        formData.permissions.includes(perm.id) && styles.permCheckboxActive,
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={saving || (!formData.username || (modalMode === "create" && !formData.password))}
              >
                {saving ? "Saving..." : modalMode === "create" ? "Create Member" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
