'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function LockCompanyButton({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call the edge function
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/partner-api`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'lock-company',
            data: { company_id: companyId }
          })
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to lock company');
      }

      router.push('/dashboard/training');
      router.refresh();

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</div>}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Confirming...' : 'Choose Company & Commit'}
      </button>
    </div>
  );
}
