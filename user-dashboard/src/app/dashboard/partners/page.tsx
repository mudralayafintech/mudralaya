import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dedicated Partners</h1>
          <p className="text-muted-foreground mt-2">
            Commit to a company for 3 months and secure stable earning potential.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies?.length === 0 ? (
          <div className="col-span-full text-center py-12 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No partner companies available at the moment.</p>
          </div>
        ) : (
          companies?.map((company: any) => (
            <div key={company.id} className="group overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                    {company.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{company.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                  {company.overview || 'Join this company to start exclusive tasks.'}
                </p>
                <Link
                  href={`/dashboard/partners/${company.id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
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
