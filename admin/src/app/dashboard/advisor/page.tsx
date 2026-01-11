"use client";

import React from "react";
import { useAdminData } from "@/hooks/useAdminData";
import DataTable from "@/components/dashboard/DataTable";
import { adminApiRequest } from "@/lib/adminApi";

export default function AdvisorPage() {
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
    { key: "irda_license", label: "IRDA License" },
    { key: "created_at", label: "Date", format: formatDate },
  ];

  const handleDelete = async (id: string | number) => {
    try {
      await adminApiRequest("delete-entry", { type: "advisor", id });
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
      data={data?.advisorApplications || []}
      onDelete={handleDelete}
    />
  );
}
