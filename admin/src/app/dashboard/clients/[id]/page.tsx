"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApiRequest } from "@/lib/adminApi";
import { ArrowLeft, Check, X, ExternalLink } from "lucide-react";
import Link from "next/link";

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

    const handleKYCUpdate = async (status: 'verified' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status === 'verified' ? 'APPROVE' : 'REJECT'} this KYC?`)) return;

        try {
            setProcessing(true);
            await adminApiRequest("update-kyc-status", {
                userId: clientId,
                status: status,
                reason: status === 'rejected' ? 'Documents invalid or unclear' : undefined
            });
            alert(`KYC ${status === 'verified' ? 'Approved' : 'Rejected'} Successfully`);
            fetchClient(); // Refresh data
        } catch (error: any) {
            alert(`Failed: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Details...</div>;
    if (!client) return <div className="p-8 text-center">Client not found</div>;

    const kyc = client.user_kyc?.[0];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/clients" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">Client Details</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Info */}
                <div className="bg-white p-6 rounded-lg shadow md:col-span-1 h-fit">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Profile Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-500">Full Name</label>
                            <p className="font-medium">{client.full_name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <p className="font-medium">{client.email_id || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Mobile</label>
                            <p className="font-medium">{client.mobile_number || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Joined Date</label>
                            <p className="font-medium">{new Date(client.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Verification Status</label>
                            <div className="mt-1">
                                {client.is_verified ? (
                                    <span className="text-green-600 font-bold flex items-center gap-1"><Check size={16} /> Verified User</span>
                                ) : (
                                    <span className="text-gray-500 flex items-center gap-1">Unverified</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* KYC Documents */}
                <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-semibold">KYC Documents</h2>
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-500">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${kyc?.status === 'verified' ? 'bg-green-100 text-green-700' :
                                    kyc?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {kyc?.status || 'Not Submitted'}
                            </span>
                        </div>
                    </div>

                    {kyc ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DocumentCard label="PAN Card" url={kyc.pan_card_url} />
                                <DocumentCard label="Aadhaar Card" url={kyc.adhaar_card_url} />
                                <DocumentCard label="Bank Proof" url={kyc.bank_proof_url} />
                                <DocumentCard label="Selfie" url={kyc.selfie_url} />
                            </div>

                            <div className="mt-8 pt-4 border-t flex justify-end gap-4">
                                {kyc.status !== 'verified' && (
                                    <button
                                        onClick={() => handleKYCUpdate('verified')}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <Check size={18} /> Approve KYC
                                    </button>
                                )}
                                {kyc.status !== 'rejected' && (
                                    <button
                                        onClick={() => handleKYCUpdate('rejected')}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                        <X size={18} /> Reject KYC
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-500">
                            User has not submitted KYC documents yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DocumentCard({ label, url }: { label: string, url: string }) {
    if (!url) return null;

    // Construct full URL if needed, assuming Supabase Storage public access is handled or signed URLs are not needed for now 
    // (If signed URLs are needed, we would need to generate them in the API, but typically for public buckets or public access it's fine. 
    // If private, we need a solution. Assuming public read for now based on context).
    const fullUrl = url.startsWith('http')
        ? url
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${url}`;

    return (
        <div className="border rounded p-3">
            <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-sm">{label}</label>
                <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs flex items-center gap-1">
                    Full Size <ExternalLink size={10} />
                </a>
            </div>
            <div className="aspect-video bg-gray-100 rounded overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={fullUrl}
                    alt={label}
                    className="w-full h-full object-cover hover:object-contain transition-all cursor-pointer"
                    onError={(e) => (e.currentTarget.src = '/placeholder.png')} // Fallback or handle error
                />
            </div>
        </div>
    )
}
