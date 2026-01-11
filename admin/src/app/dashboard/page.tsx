"use client";

import React from "react";
import { useAdminData } from "@/hooks/useAdminData";
import StatsOverview from "@/components/dashboard/StatsOverview";
import DataTable from "@/components/dashboard/DataTable";
import { adminApiRequest } from "@/lib/adminApi";

import styles from "./dashboard.module.css";
import Link from "next/link";

export default function DashboardPage() {
  const { data, loading, refresh } = useAdminData();

  const formatDate = (value: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const joinColumns = [
    { key: "full_name", label: "Name" },
    { key: "mobile_number", label: "Mobile" },
    { key: "profession", label: "Profession" },
    {
      key: "amount",
      label: "Amount (₹)",
      format: (val: any) => (val ? val.toLocaleString() : "-"),
    },
    {
      key: "payment_status",
      label: "Status",
      format: (val: string) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
            val === "Paid"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {val || "Pending"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      format: (val: string) => formatDate(val).split(",")[0],
    },
  ];

  const handleDelete = async (id: string | number) => {
    try {
      await adminApiRequest("delete-entry", { type: "join", id });
      refresh();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500 animate-pulse">
        Loading Dashboard...
      </div>
    );

  return (
    <div className={styles.pageContainer}>
      <StatsOverview data={data} />

      <div className={styles.grid}>
        <div className="flex-1 overflow-hidden">
          <DataTable
            title="Recent Registrations"
            columns={joinColumns}
            data={data?.joinRequests?.slice(0, 5) || []}
            onDelete={handleDelete}
          />
        </div>

        <div className={styles.messagesCard}>
          <div className={styles.cardHeader}>
            <h6 className={styles.cardTitle}>Recent Messages</h6>
            <Link href="/dashboard/contacts" className={styles.viewAll}>
              View All
            </Link>
          </div>
          <div className={styles.messageList}>
            {data?.contacts?.slice(0, 5).map((msg: any, i: number) => (
              <div key={i} className={styles.messageItem}>
                <div className={styles.msgHeader}>
                  <span className={styles.msgName}>{msg.fullName}</span>
                  <span className={styles.msgDate}>
                    {formatDate(msg.createdAt).split(",")[0]}
                  </span>
                </div>
                <p className={styles.msgSubject}>
                  {msg.subject || "No subject"}
                </p>
              </div>
            ))}
            {(!data?.contacts || data.contacts.length === 0) && (
              <div className="text-gray-400 text-sm text-center py-8">
                No recent messages
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
