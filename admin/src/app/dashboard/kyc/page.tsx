"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { adminApiRequest } from "@/lib/adminApi";
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
  status: "pending" | "approved" | "verified" | "rejected" | "fail";
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

// Document Card Component
function DocumentCard({
  label,
  url,
  onView,
}: {
  label: string;
  url: string;
  onView: (url: string) => void;
}) {
  return (
    <div className={styles.docCard}>
      <div className={styles.docHeader}>
        <FileText size={16} /> {label}
      </div>
      <div
        className={styles.docPreview}
        onClick={() => url && onView(url)}
        style={{ cursor: url ? "pointer" : "not-allowed" }}
      >
        {url ? (
          <>
            <div className={styles.viewOverlay}>Click to View</div>
            <div className={styles.docPlaceholder}>
              <FileText size={32} />
              <span>View Document</span>
            </div>
          </>
        ) : (
          <div className={styles.docPlaceholder}>
            <X size={32} />
            <span>Not Available</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KYCPage() {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const supabase = createClient();

  useEffect(() => {
    fetchKYCRecords();
  }, []);

  const fetchKYCRecords = async () => {
    try {
      setLoading(true);

      // Check if admin is logged in
      const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      if (!adminToken) {
        console.warn("Admin token not found, using direct database query");
        // Fall through to direct query
      } else {
        // Use admin-api to fetch KYC records with user details
        try {
          const kycData = await adminApiRequest("get-kyc-records", {});

          if (!kycData || kycData.length === 0) {
            setRecords([]);
            return;
          }

          setRecords(kycData);
          return; // Success, exit early
        } catch (apiErr: any) {
          console.error("Error fetching KYC via admin-api:", apiErr);
          
          // If unauthorized, redirect to login
          if (apiErr.message?.includes("Unauthorized") || apiErr.message?.includes("401")) {
            console.warn("Unauthorized, redirecting to login");
            window.location.href = "/login";
            return;
          }
          
          // For other errors, fall through to direct query
          console.warn("Falling back to direct database query");
        }
      }
      
      // Fallback to direct database query if admin-api fails or no token
      const { data: kycData, error: kycError } = await supabase
        .from("user_kyc")
        .select("*")
        .order("created_at", { ascending: false });

      if (kycError) {
        console.error("Direct DB query error:", kycError);
        setRecords([]);
        return;
      }

      if (!kycData || kycData.length === 0) {
        setRecords([]);
        return;
      }

      const userIds = Array.from(
        new Set(kycData.map((r) => r.user_id).filter(Boolean))
      );

      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, full_name, email_id, mobile_number, phone")
          .in("id", userIds);

        if (usersError) console.error("Error fetching users:", usersError);

        const mergedRecords = kycData.map((record) => {
          const profile = usersData?.find((u) => u.id === record.user_id);
          return {
            ...record,
            users: profile ? {
              full_name: profile.full_name,
              email_id: profile.email_id,
              mobile_number: profile.mobile_number || profile.phone,
            } : null,
          };
        });

        setRecords(mergedRecords);
      } else {
        // No user IDs, return records without user data
        setRecords(kycData.map((r: any) => ({ ...r, users: null })));
      }
    } catch (err: any) {
      console.error("Unexpected error fetching KYC:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected" | "verified",
    reason?: string
  ) => {
    try {
      setActionLoading(true);
      
      // Use admin-api for status updates
      await adminApiRequest("update-kyc-status", {
        userId: id, // This is actually the KYC ID
        status: status === "approved" ? "verified" : status,
        reason: reason || null,
      });

      // Update local state
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: status === "approved" ? "verified" : status, rejection_reason: reason } : r))
      );
      
      if (selectedRecord?.id === id) {
        setSelectedRecord({
          ...selectedRecord,
          status: status === "approved" ? "verified" : status,
          rejection_reason: reason,
        });
      }
      
      setShowRejectInput(false);
      setRejectReason("");
      alert(`KYC ${status === "approved" ? "Approved" : "Rejected"} successfully!`);
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert(`Failed to update status: ${err.message || "Unknown error"}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to get signed URL for viewing private docs
  const getDocumentUrl = async (path: string): Promise<string | null> => {
    if (!path) return null;
    
    // Check if it's already a full URL
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // Try to create signed URL from storage
    try {
      const { data, error } = await supabase.storage
        .from("kyc-documents")
        .createSignedUrl(path, 3600); // 1 hour access

      if (error) {
        console.error("Error creating signed URL:", error);
        // Try public URL as fallback
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${path}`;
        return publicUrl;
      }

      return data?.signedUrl || null;
    } catch (err) {
      console.error("Error getting document URL:", err);
      // Fallback to public URL
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${path}`;
      return publicUrl;
    }
  };

  const openDocument = async (path: string) => {
    const url = await getDocumentUrl(path);
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("Unable to load document. Please try again.");
    }
  };

  // Filter records based on search and status
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      !searchQuery ||
      record.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.users?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.users?.email_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.users?.mobile_number?.includes(searchQuery);

    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "approved") {
      // Show both approved and verified for "approved" filter
      matchesStatus = record.status === "approved" || record.status === "verified";
    } else {
      matchesStatus = record.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
        return (
          <span className={`${styles.badge} ${styles.status_approved}`}>
            <CheckCircle size={14} /> {status === "verified" ? "Verified" : "Approved"}
          </span>
        );
      case "rejected":
      case "fail":
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

      {/* Search and Filter */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, phone, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.statusFilter}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="fail">Failed</option>
        </select>
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
              <th>User</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">
                  Loading records...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">
                  {records.length === 0
                    ? "No KYC requests found."
                    : "No records match your search."}
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className={styles.row}>
                  <td>{getStatusBadge(record.status)}</td>
                  <td>
                    <div>
                      <div className="font-semibold text-sm">
                        {record.users?.full_name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        ID: {record.user_id.slice(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <div>{record.users?.email_id || "N/A"}</div>
                      <div className="text-xs text-gray-500">
                        {record.users?.mobile_number || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td>
                    {new Date(record.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setSelectedRecord(record)}
                      title="View Details & Documents"
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
              {/* User Information */}
              <div className={styles.userInfoCard}>
                <div className={styles.userInfoHeader}>
                  <User size={20} />
                  <h4>User Information</h4>
                </div>
                <div className={styles.userInfoGrid}>
                  <div>
                    <label>Name</label>
                    <div>{selectedRecord.users?.full_name || "N/A"}</div>
                  </div>
                  <div>
                    <label>Email</label>
                    <div>{selectedRecord.users?.email_id || "N/A"}</div>
                  </div>
                  <div>
                    <label>Phone</label>
                    <div>{selectedRecord.users?.mobile_number || "N/A"}</div>
                  </div>
                  <div>
                    <label>User ID</label>
                    <div className="font-mono text-xs">{selectedRecord.user_id}</div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className={styles.documentsSection}>
                <h4 className={styles.sectionTitle}>Submitted Documents</h4>
                <div className={styles.docGrid}>
                  <DocumentCard
                    label="PAN Card"
                    url={selectedRecord.pan_card_url}
                    onView={openDocument}
                  />
                  <DocumentCard
                    label="Aadhaar Card"
                    url={selectedRecord.adhaar_card_url}
                    onView={openDocument}
                  />
                  <DocumentCard
                    label="Bank Proof"
                    url={selectedRecord.bank_proof_url}
                    onView={openDocument}
                  />
                  <DocumentCard
                    label="Selfie / Photo"
                    url={selectedRecord.selfie_url}
                    onView={openDocument}
                  />
                </div>
              </div>

              {/* Rejection Reason Display */}
              {selectedRecord.status === "rejected" &&
                selectedRecord.rejection_reason && (
                  <div className={styles.rejectionReason}>
                    <strong>Rejection Reason:</strong>
                    <p>{selectedRecord.rejection_reason}</p>
                  </div>
                )}
            </div>

            <div className={styles.modalActions}>
              {(selectedRecord.status === "pending" ||
                selectedRecord.status === "rejected") && (
                <>
                  {showRejectInput ? (
                    <div className={styles.rejectInputContainer}>
                      <textarea
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className={styles.rejectTextarea}
                        rows={3}
                      />
                      <div className={styles.rejectActions}>
                        <button
                          className={styles.btnCancel}
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
                              alert("Please provide a rejection reason.");
                              return;
                            }
                            updateStatus(
                              selectedRecord.id,
                              "rejected",
                              rejectReason
                            );
                          }}
                          disabled={actionLoading}
                        >
                          Confirm Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        className={`${styles.btn} ${styles.btnReject}`}
                        onClick={() => setShowRejectInput(true)}
                        disabled={actionLoading}
                      >
                        <XCircle size={18} /> Reject
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnApprove}`}
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to approve this KYC? This will verify the user."
                            )
                          ) {
                            updateStatus(selectedRecord.id, "approved");
                          }
                        }}
                        disabled={actionLoading}
                      >
                        <CheckCircle size={18} /> Approve
                      </button>
                    </>
                  )}
                </>
              )}
              <button
                className={`${styles.btn} ${styles.btnClose}`}
                onClick={() => {
                  setSelectedRecord(null);
                  setShowRejectInput(false);
                  setRejectReason("");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
