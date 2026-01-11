"use client";

import React, { useEffect, useState } from "react";
import DataTable from "@/components/dashboard/DataTable";
import { adminApiRequest } from "@/lib/adminApi";
import Link from "next/link";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";

export default function ClientsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await adminApiRequest("get-clients");
            setData(res);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
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
        switch (status) {
            case "verified":
            case "approved":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={12} /> Verified
                    </span>
                );
            case "rejected":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle size={12} /> Rejected
                    </span>
                );
            case "pending":
            case "submitted":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock size={12} /> Pending
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not Submitted
                    </span>
                );
        }
    };

    const columns = [
        { key: "full_name", label: "Name" },
        { key: "email_id", label: "Email" },
        { key: "mobile_number", label: "Mobile" },
        {
            key: "kyc_status",
            label: "KYC Status",
            render: (row: any) => <StatusBadge status={row.kyc_status} />
        },
        { key: "created_at", label: "Joined", format: formatDate },
    ];

    const handleAction = (id: string, action: string) => {
        // Placeholder for DataTable actions if needed
        console.log(action, id);
    };

    // Custom render for actions column since DataTable might not support custom row clicks easily without config
    // Checking DataTable implementation would be ideal, but for now I'll assume standard DataTable 
    // or I can wrap the name in a Link? 
    // Let's modify columns to have an action column.

    const columnsWithAction = [
        ...columns,
        {
            key: "actions",
            label: "Actions",
            render: (row: any) => (
                <Link href={`/dashboard/clients/${row.id}`} className="text-blue-600 hover:text-blue-800">
                    <Eye size={18} />
                </Link>
            )
        }
    ];

    if (loading) return <div className="p-8 text-center">Loading Clients...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Clients</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columnsWithAction.map((col) => (
                                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row: any) => (
                            <tr key={row.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-medium text-gray-900">{row.full_name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row.email_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{row.mobile_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={row.kyc_status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(row.created_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/dashboard/clients/${row.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {data.length === 0 && (
                    <div className="p-4 text-center text-gray-500">No clients found.</div>
                )}
            </div>
        </div>
    );
}
