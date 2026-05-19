'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import styles from '../partners.module.css';

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
    <div className={styles.buttonStack}>
      {error && <div className={styles.errorBox}>{error}</div>}
      <button
        onClick={handleConfirm}
        disabled={loading}
        className={styles.button}
      >
        {loading ? 'Confirming...' : 'Choose Company & Commit'}
      </button>
    </div>
  );
}
