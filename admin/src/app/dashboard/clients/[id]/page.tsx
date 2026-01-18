"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiRequest } from "@/lib/adminApi";
import {
  ArrowLeft,
  Check,
  X,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import styles from "./client-details.module.css";

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const res = await adminApiRequest("get-client-details", { clientId });
      setClient(res);
    } catch (error) {
      console.error("Failed to fetch client:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) fetchClient();
  }, [clientId]);

  const handleKYCUpdate = async (status: "verified" | "rejected") => {
    if (
      !confirm(
        `Are you sure you want to ${status === "verified" ? "APPROVE" : "REJECT"} this KYC?`,
      )
    )
      return;

    try {
      setProcessing(true);
      await adminApiRequest("update-kyc-status", {
        userId: clientId,
        status: status,
        reason:
          status === "rejected" ? "Documents invalid or unclear" : undefined,
      });
      alert(
        `KYC ${status === "verified" ? "Approved" : "Rejected"} Successfully`,
      );
      fetchClient(); // Refresh data
    } catch (error: any) {
      alert(`Failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className={styles.centerState}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );

  if (!client)
    return (
      <div className={styles.centerState}>
        <h2 className={styles.sectionTitle}>Client Not Found</h2>
        <Link href="/dashboard/clients" style={{ color: "#4f46e5" }}>
          Return to Clients List
        </Link>
      </div>
    );

  const kyc = client.user_kyc?.[0];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "verified":
        return { backgroundColor: "#ecfdf5", color: "#047857" };
      case "rejected":
        return { backgroundColor: "#fef2f2", color: "#b91c1c" };
      case "pending":
        return { backgroundColor: "#fffbeb", color: "#b45309" };
      default:
        return { backgroundColor: "#f1f5f9", color: "#475569" };
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/dashboard/clients" className={styles.backButton}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className={styles.title}>Client Verification</h1>
          <p className={styles.subtitle}>
            Review client details and KYC documents
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Profile Card */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 24 }}>
            Profile Summary
          </h2>

          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              {client.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <h3 className={styles.profileName}>{client.full_name}</h3>
            <p className={styles.profileJoined}>
              Member since {new Date(client.created_at).toLocaleDateString()}
            </p>
          </div>

          <div style={{ paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
            <div className={styles.infoGroup}>
              <label className={styles.label}>Email Address</label>
              <p className={styles.value}>{client.email_id || "N/A"}</p>
            </div>
            <div className={styles.infoGroup}>
              <label className={styles.label}>Phone Number</label>
              <p className={styles.value}>
                {client.mobile_number || client.phone || "N/A"}
              </p>
            </div>
            <div className={styles.infoGroup}>
              <label className={styles.label}>Verification</label>
              <div style={{ marginTop: 4 }}>
                {client.is_verified || kyc?.status === "verified" ? (
                  <span
                    style={{
                      color: "#059669",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Check size={16} strokeWidth={3} /> Verified
                  </span>
                ) : (
                  <span style={{ color: "#64748b" }}>Unverified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* KYC Section */}
        <div className={styles.kycSection}>
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>KYC Documentation</h2>
                <p className={styles.subtitle}>
                  Review submitted identity proofs
                </p>
              </div>
              <div className={styles.badge} style={getStatusStyle(kyc?.status)}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "currentColor",
                    opacity: 0.5,
                  }}
                ></span>
                {kyc?.status || "Not Submitted"}
              </div>
            </div>

            {kyc ? (
              <div>
                <div className={styles.documentsGrid}>
                  <DocumentCard label="PAN Card" url={kyc.pan_card_url} />
                  <DocumentCard
                    label="Aadhaar Card"
                    url={kyc.adhaar_card_url}
                  />
                  <DocumentCard label="Bank Proof" url={kyc.bank_proof_url} />
                  <DocumentCard label="Selfie / Photo" url={kyc.selfie_url} />
                </div>

                <div className={styles.actionsBar}>
                  {kyc.status !== "verified" && (
                    <button
                      onClick={() => handleKYCUpdate("verified")}
                      disabled={processing}
                      className={`${styles.btn} ${styles.btnApprove}`}
                    >
                      <CheckCircle size={18} /> Approve KYC
                    </button>
                  )}
                  {kyc.status !== "rejected" && (
                    <button
                      onClick={() => handleKYCUpdate("rejected")}
                      disabled={processing}
                      className={`${styles.btn} ${styles.btnReject}`}
                    >
                      <XCircle size={18} /> Reject KYC
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={styles.centerState}
                style={{
                  minHeight: 200,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: "#e2e8f0",
                  borderRadius: 12,
                }}
              >
                <ExternalLink size={24} style={{ opacity: 0.3 }} />
                <p>No documents submitted</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentCard({ label, url }: { label: string; url: string }) {
  if (!url) return null;

  const fullUrl = url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${url}`;

  return (
    <div className={styles.docCard}>
      <div className={styles.docHeader}>
        <label className={styles.docTitle}>{label}</label>
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewLink}
        >
          View Full <ExternalLink size={12} />
        </a>
      </div>
      <div className={styles.docPreview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullUrl}
          alt={label}
          className={styles.docImage}
          onError={(e) => (e.currentTarget.src = "/placeholder.png")}
        />
      </div>
    </div>
  );
}
