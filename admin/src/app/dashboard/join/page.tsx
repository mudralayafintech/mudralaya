"use client";

import React from "react";
import { useAdminData } from "@/hooks/useAdminData";
import DataTable from "@/components/dashboard/DataTable";
import { adminApiRequest } from "@/lib/adminApi";

export default function JoinRequestsPage() {
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

  const columns = [
    { key: "full_name", label: "Name" },
    { key: "mobile_number", label: "Mobile" },
    { key: "email_id", label: "Email" },
    { key: "profession", label: "Profession" },
    {
      key: "has_laptop",
      label: "Laptop",
      format: (val: any) => (val ? "Yes" : val === false ? "No" : "-"),
    },
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
    { key: "razorpay_payment_id", label: "Pay ID" },
    { key: "created_at", label: "Registered", format: formatDate },
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
    return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <DataTable
      title="" // Hiding title as specific pages have TopHeader
      columns={columns}
      data={data?.joinRequests || []}
      onDelete={handleDelete}
    />
  );
}
