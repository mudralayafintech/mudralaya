"use client";

import React from "react";
import { useAdminData } from "@/hooks/useAdminData";
import DataTable from "@/components/dashboard/DataTable";
import { adminApiRequest } from "@/lib/adminApi";

export default function ContactsPage() {
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
    { key: "fullName", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone" },
    { key: "subject", label: "Subject" },
    { key: "createdAt", label: "Date", format: formatDate },
  ];

  const handleDelete = async (id: string | number) => {
    try {
      await adminApiRequest("delete-entry", { type: "contact", id });
      refresh();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <DataTable
      title=""
      columns={columns}
      data={data?.contacts || []}
      onDelete={handleDelete}
    />
  );
}
