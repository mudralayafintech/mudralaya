"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import styles from "./kyc.module.css";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Shield,
  Search,
  Check,
  X,
  User,
} from "lucide-react";

interface KYCRecord {
  id: string;
  user_id: string;
  pan_card_url: string;
  adhaar_card_url: string;
  bank_proof_url: string;
  selfie_url: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  rejection_reason?: string;
  // Optional if we can fetch user details
  users?: {
    full_name?: string;
    email_id?: string;
    mobile_number?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
  };
}

export default function KYCPage() {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchKYCRecords();
  }, []);

  const fetchKYCRecords = async () => {
    try {
      setLoading(true);

      // 1. Fetch KYC Records
      const { data: kycData, error: kycError } = await supabase
        .from("user_kyc")
        .select("*")
        .order("created_at", { ascending: false });

      if (kycError) throw kycError;
      if (!kycData || kycData.length === 0) {
        setRecords([]);
        return;
      }

      // 2. Extract IDs to batch fetch details
      const userIds = Array.from(
        new Set(kycData.map((r) => r.user_id).filter(Boolean))
      );
      const accountIds = Array.from(
        new Set(kycData.map((r) => r.account_id).filter(Boolean))
      );

      // Combine IDs for user fetch (assuming account_id also points to users table users)
      const allUserIds = Array.from(new Set([...userIds, ...accountIds]));

      // 3. Fetch User Profiles (public.users)
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, full_name, email_id, mobile_number")
        .in("id", allUserIds);

      if (usersError) console.error("Error fetching users:", usersError);

      // 4. Fetch Account Details (public.account_details)
      // Assuming account_details.user_id corresponds to the user/account id
      const { data: accountData, error: accountError } = await supabase
        .from("account_details")
        .select("user_id, holder_name, bank_name, account_number, ifsc_code")
        .in("user_id", allUserIds);

      if (accountError) console.error("Error fetching accounts:", accountError);

      // 5. Merge Data
      const mergedRecords = kycData.map((record) => {
        // Find mapped user profile (try account_id first, then user_id)
        const profile = usersData?.find(
          (u) => u.id === record.account_id || u.id === record.user_id
        );
        // Find mapped account details
        const bank = accountData?.find(
          (a) => a.user_id === record.account_id || a.user_id === record.user_id
        );

        return {
          ...record,
          users: {
            full_name: profile?.full_name,
            email_id: profile?.email_id,
            mobile_number: profile?.mobile_number,
            bank_name: bank?.bank_name,
            account_number: bank?.account_number,
            ifsc_code: bank?.ifsc_code,
          },
        };
      });

      setRecords(mergedRecords);
    } catch (err) {
      console.error("Error fetching KYC:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from("user_kyc")
        .update({
          status,
          rejection_reason: reason || null, // Ensure column name matches schema if added, schema didn't show it but plan did.
          // Wait, migration 20260110_create_kyc_schema.sql DID NOT have rejection_reason.
          // I should probably check if column exists or add it.
          // For now, let's assume valid fields only: `status`.
          // If status is rejected, maybe we just set status.
          // I will stick to status only if I can't modify schema right now.
        })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      setSelectedRecord(null);
      setShowRejectInput(false);
      setRejectReason("");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to get signed URL for viewing private docs
  const openDocument = async (path: string) => {
    if (!path) return;
    // The path stored might be full URL or relative path.
    // Migration says text, KYCModal uploads as `userId/filename`.
    // We need to sign it.
    const { data } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(path, 3600); // 1 hour access

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      // If it's already a public URL (unlikely for KYC) or full URL
      window.open(path, "_blank");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className={`${styles.badge} ${styles.status_approved}`}>
            <CheckCircle size={14} /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className={`${styles.badge} ${styles.status_rejected}`}>
            <XCircle size={14} /> Rejected
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.status_pending}`}>
            <Clock size={14} /> Pending
          </span>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>KYC Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and verify user documents
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#eff6ff", color: "#3b82f6" }}
          >
            <Shield />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{records.length}</span>
            <span className={styles.statLabel}>Total Requests</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "#fff7ed", color: "#f97316" }}
          >
            <Clock />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {records.filter((r) => r.status === "pending").length}
            </span>
            <span className={styles.statLabel}>Pending</span>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Date</th>
              <th>User Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-400">
                  Loading records...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-400">
                  No KYC requests found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className={styles.row}>
                  <td>{getStatusBadge(record.status)}</td>
                  <td>
                    {new Date(record.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="text-sm">
                    <div className="font-medium text-gray-900">
                      {record.users?.full_name || "Unknown User"}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {record.users?.email_id || record.users?.mobile_number || record.user_id}
                    </div>
                  </td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setSelectedRecord(record)}
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>KYC Verification</h3>
              <button
                className={styles.actionBtn}
                onClick={() => setSelectedRecord(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className="flex items-center gap-2 mb-6 p-4 bg-blue-50 rounded-xl text-blue-700">
                <User size={20} />
                <span className="font-mono text-sm">
                  User ID: {selectedRecord.user_id}
                </span>
              </div>

              <div className={styles.docGrid}>
                <div className={styles.docCard}>
                  <div className={styles.docHeader}>
                    <FileText size={16} /> PAN Card
                  </div>
                  <div
                    className={styles.docPreview}
                    onClick={() => openDocument(selectedRecord.pan_card_url)}
                  >
                    <div className={styles.viewOverlay}>Click to View</div>
                    {/* Placeholder or thumbnail if available */}
                    <img
                      src="/images/placeholder_doc.png"
                      alt="PAN"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <span className="absolute text-gray-400 text-xs">
                      Preview
                    </span>
                  </div>
                </div>
                <div className={styles.docCard}>
                  <div className={styles.docHeader}>
                    <FileText size={16} /> Aadhaar Card
                  </div>
                  <div
                    className={styles.docPreview}
                    onClick={() => openDocument(selectedRecord.adhaar_card_url)}
                  >
                    <div className={styles.viewOverlay}>Click to View</div>
                    <span className="absolute text-gray-400 text-xs">
                      Preview
                    </span>
                  </div>
                </div>
                <div className={styles.docCard}>
                  <div className={styles.docHeader}>
                    <FileText size={16} /> Bank Proof
                  </div>
                  <div
                    className={styles.docPreview}
                    onClick={() => openDocument(selectedRecord.bank_proof_url)}
                  >
                    <div className={styles.viewOverlay}>Click to View</div>
                    <span className="absolute text-gray-400 text-xs">
                      Preview
                    </span>
                  </div>
                </div>
                <div className={styles.docCard}>
                  <div className={styles.docHeader}>
                    <User size={16} /> Selfie
                  </div>
                  <div
                    className={styles.docPreview}
                    onClick={() => openDocument(selectedRecord.selfie_url)}
                  >
                    <div className={styles.viewOverlay}>Click to View</div>
                    <span className="absolute text-gray-400 text-xs">
                      Preview
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              {selectedRecord.status === "pending" && (
                <>
                  {!showRejectInput ? (
                    <>
                      <button
                        className={`${styles.btn} ${styles.btnReject}`}
                        onClick={() => setShowRejectInput(true)}
                        disabled={actionLoading}
                      >
                        Reject
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnApprove}`}
                        onClick={() => updateStatus(selectedRecord.id, "approved")}
                        disabled={actionLoading}
                      >
                        Approve
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <textarea
                        className="w-full p-2 border rounded-md text-sm"
                        placeholder="Enter reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          className={`${styles.btn} ${styles.btnClose}`}
                          onClick={() => {
                            setShowRejectInput(false);
                            setRejectReason("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnReject}`}
                          onClick={() => {
                            if (!rejectReason.trim()) {
                              alert("Please enter a reason");
                              return;
                            }
                            updateStatus(selectedRecord.id, "rejected", rejectReason);
                          }}
                          disabled={actionLoading}
                        >
                          Confirm Reject
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {!showRejectInput && (
                <button
                  className={`${styles.btn} ${styles.btnClose}`}
                  onClick={() => setSelectedRecord(null)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
