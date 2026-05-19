import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import styles from './partners.module.css';

export const dynamic = 'force-dynamic';

export default async function PartnersPage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dedicated Partners</h1>
          <p className={styles.subtitle}>
            Commit to a company for 3 months and secure stable earning potential.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {companies?.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No partner companies available at the moment.</p>
          </div>
        ) : (
          companies?.map((company: any) => (
            <div key={company.id} className={styles.card}>
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <div className={styles.icon}>
                    {company.name.charAt(0)}
                  </div>
                </div>
                <h3 className={styles.companyName}>{company.name}</h3>
                <p className={styles.overview}>
                  {company.overview || 'Join this company to start exclusive tasks.'}
                </p>
                <Link
                  href={`/dashboard/partners/${company.id}`}
                  className={styles.button}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
