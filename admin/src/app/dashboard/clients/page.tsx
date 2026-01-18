"use client";

import React, { useEffect, useState } from "react";
import { adminApiRequest } from "@/lib/adminApi";
import Link from "next/link";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import styles from "./clients.module.css";

export default function ClientsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await adminApiRequest("get-clients");
      // Log response to debug
      console.log("Clients Response:", res);
      setData(res || []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const formatDate = (value: string) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusKey = status?.toLowerCase() || "default";

    let badgeClass = styles.badgeDefault;
    let icon = <Clock size={14} />;

    if (statusKey === "verified" || statusKey === "approved") {
      badgeClass = styles.badgeVerified;
      icon = <CheckCircle size={14} />;
    } else if (statusKey === "rejected") {
      badgeClass = styles.badgeRejected;
      icon = <XCircle size={14} />;
    } else if (statusKey === "pending" || statusKey === "submitted") {
      badgeClass = styles.badgePending;
      icon = <Clock size={14} />;
    }

    return (
      <span className={`${styles.badge} ${badgeClass}`}>
        {icon}
        <span className="capitalize">{status || "Not Submitted"}</span>
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Clients</h1>
          <p className={styles.subtitle}>Manage and monitor your client base</p>
        </div>
        {/* Placeholder for future actions */}
        {/* <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-sm hover:shadow">
          Export List
        </button> */}
      </div>

      <div className={styles.card}>
        {/* Header Row */}
        <div className={styles.gridHeader}>
          <div>Client</div>
          <div>Contact</div>
          <div>Status</div>
          <div>Joined</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>

        {/* Data Rows */}
        <div>
          {data.map((row: any) => (
            <div key={row.id} className={styles.gridRow}>
              {/* Client Info */}
              <div className={styles.cellClient}>
                <div className={styles.avatar}>
                  {row.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <span className={styles.name}>{row.full_name || "N/A"}</span>
                </div>
              </div>

              {/* Contact */}
              <div className={styles.cellContact}>
                <div className={styles.email}>{row.email_id}</div>
                <div className={styles.mobile}>{row.mobile_number}</div>
              </div>

              {/* Status */}
              <div className={styles.cellStatus}>
                <StatusBadge status={row.kyc_status} />
              </div>

              {/* Joined */}
              <div className={styles.cellJoined}>
                <Clock size={14} />
                {formatDate(row.created_at)}
              </div>

              {/* Actions */}
              <div className={styles.cellActions}>
                <Link
                  href={`/dashboard/clients/${row.id}`}
                  className={styles.viewButton}
                  title="View Details"
                >
                  <Eye size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Eye size={32} />
            </div>
            <h3 className={styles.name}>No clients found</h3>
            <p className={styles.subtitle}>
              New clients will appear here once they register.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
