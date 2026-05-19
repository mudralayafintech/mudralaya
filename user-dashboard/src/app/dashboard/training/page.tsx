import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DownloadCertificateButton from './DownloadCertificateButton';
import DedicatedWorkSubmission from './DedicatedWorkSubmission';
import styles from './training.module.css';

export const dynamic = 'force-dynamic';

export default async function TrainingDashboard() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return redirect('/login');

  // Fetch user's active company lock
  const { data: activeLock } = await supabase
    .from('user_company_locks')
    .select('*, companies(*)')
    .eq('user_id', session.user.id)
    .in('status', ['active', 'completed'])
    .order('locked_at', { ascending: false })
    .limit(1)
    .single();

  if (!activeLock) {
    return (
      <div className={styles.centerContainer}>
        <div className={styles.iconCircle}>
          <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className={styles.title}>No Active Training</h1>
        <p className={styles.subtitle}>You are not currently locked to any partner company.</p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/dashboard/partners" className={styles.buttonPrimary}>
            Browse Dedicated Partners
          </Link>
        </div>
      </div>
    );
  }

  const company = (activeLock as any).companies;
  const isCompleted = activeLock.status === 'completed' || new Date(activeLock.expires_at) <= new Date();

  // Fetch training modules for this company
  const { data: modules } = await supabase
    .from('training_modules')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: true });

  // Fetch user progress
  const { data: progress } = await supabase
    .from('user_trainings')
    .select('*')
    .eq('user_id', session.user.id);

  const progressMap = progress?.reduce((acc: any, curr: any) => {
    acc[curr.module_id] = curr.status;
    return acc;
  }, {}) || {};

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.title}>Training Dashboard</h1>
        <p className={styles.subtitle}>
          {company.name} - Company Specific Training
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <h2 className={styles.sectionTitle}>Modules</h2>
          {modules?.length === 0 ? (
            <div className={styles.emptyState}>
              No training modules have been uploaded yet.
            </div>
          ) : (
            <div className={styles.modulesList}>
              {modules?.map((mod, index) => {
                const status = progressMap[mod.id] || 'pending';
                return (
                  <div key={mod.id} className={styles.moduleCard}>
                    <div className={styles.moduleInfo}>
                      <div className={styles.moduleNumber}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className={styles.moduleTitle}>{mod.title}</h3>
                        <p className={`${styles.statusBadge} ${
                          status === 'completed' ? styles.statusCompleted :
                          status === 'in_progress' ? styles.statusProgress :
                          styles.statusPending
                        }`}>
                          {status.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {/* Placeholder for actual training viewer link */}
                    <button className={styles.moduleButton}>
                      {status === 'completed' ? 'Review' : 'Start'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dedicated Work Submission Section */}
          {!isCompleted && (
            <div style={{ marginTop: '2rem' }} className={styles.mainColumn}>
              <h2 className={styles.sectionTitle}>Submit Work</h2>
              <p className={styles.sectionSubtitle}>
                Upload proof of your completed work for {company.name}
              </p>
              <DedicatedWorkSubmission companyId={company.id} companyName={company.name} />
            </div>
          )}
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.commitmentCard}>
            <h2 className={styles.commitmentTitle}>Your Commitment</h2>
            <div className={styles.commitmentList}>
              <div>
                <p className={styles.commitmentItemLabel}>Company</p>
                <p className={styles.commitmentItemValue}>{company.name}</p>
              </div>
              <div>
                <p className={styles.commitmentItemLabel}>Locked Untill</p>
                <p className={styles.commitmentItemValue}>{new Date(activeLock.expires_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className={styles.commitmentItemLabel}>Status</p>
                <p className={isCompleted ? styles.commitmentItemValueSuccess : styles.commitmentItemValuePrimary}>
                  {isCompleted ? 'Completed' : 'Active'}
                </p>
              </div>
            </div>
            
            <div className={styles.certificateSection}>
              <h3 className={styles.certificateTitle}>Completion Certificate</h3>
              <p className={styles.certificateDesc}>
                Available after your 3-month term completes.
              </p>
              {isCompleted ? (
                <DownloadCertificateButton companyId={company.id} />
              ) : (
                <div className={styles.lockedButton}>
                  Locked
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
