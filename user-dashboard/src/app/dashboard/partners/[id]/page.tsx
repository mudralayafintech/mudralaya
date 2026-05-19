import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LockCompanyButton from './LockCompanyButton';
import styles from '../partners.module.css';

export const dynamic = 'force-dynamic';

export default async function PartnerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return redirect('/login');

  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!company || error) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>Company not found.</p>
      </div>
    );
  }

  // Check if user is already locked to ANY company
  const { data: activeLock } = await supabase
    .from('user_company_locks')
    .select('*, companies(name)')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .single();

  return (
    <div className={styles.detailContainer}>
      <div>
        <div className={styles.largeIcon}>
          {company.name.charAt(0)}
        </div>
        <h1 className={styles.largeCompanyName}>{company.name}</h1>
        <p className={styles.largeOverview}>{company.overview}</p>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.buttonStack}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Standard Operating Procedures (SOPs)</h2>
            <div className={styles.prose}>
              {company.sops || 'No SOPs available right now.'}
            </div>
          </div>
        </div>

        <div className={styles.buttonStack}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>Training Preview</h2>
            <div className={styles.prose}>
              {company.training_preview || 'Training details will be provided upon commitment.'}
            </div>
          </div>

          <div className={styles.commitmentCard}>
            <h2 className={styles.commitmentTitle}>3-Month Commitment</h2>
            <p className={styles.commitmentDesc}>
              By choosing this company, you commit to working with them for a minimum of 3 months. During this period, you will have exclusive access to their tasks and training modules.
            </p>
            
            {activeLock ? (
              <div className={styles.lockBox}>
                You are currently locked with {(activeLock as any).companies?.name || 'another company'} until {new Date(activeLock.expires_at).toLocaleDateString()}.
              </div>
            ) : (
              <LockCompanyButton companyId={company.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
