'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function DownloadCertificateButton({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // 1. Request Certificate (creates an unpaid one if it doesn't exist)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/partner-api`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'request-certificate',
            data: { company_id: companyId }
          })
        }
      );

      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error);

      const certificate = result.certificate;

      if (!certificate.is_paid) {
        // Redirect to payment flow (to be handled properly with Razorpay hook normally)
        // For simplicity in this step, redirect to membership/payment page where they pay ₹499
        router.push(`/dashboard/membership?type=certificate&companyId=${companyId}`);
        return;
      }

      // If paid, allow download (Simulating a download popup or opening a PDF in a new tab)
      alert("Certificate ready for download! (PDF generation logic placeholder)");
      
    } catch (err: any) {
      setError(err.message || 'Failed to process certificate request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Request Certificate'}
      </button>
    </div>
  );
}
