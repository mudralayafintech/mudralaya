import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import LockCompanyButton from './LockCompanyButton';

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
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground text-center">Company not found.</p>
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
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-3xl mb-6">
          {company.name.charAt(0)}
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{company.name}</h1>
        <p className="text-muted-foreground text-lg">{company.overview}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Standard Operating Procedures (SOPs)</h2>
            <div className="prose prose-sm dark:prose-invert">
              {company.sops || 'No SOPs available right now.'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Training Preview</h2>
            <div className="prose prose-sm dark:prose-invert">
              {company.training_preview || 'Training details will be provided upon commitment.'}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-2">3-Month Commitment</h2>
            <p className="text-sm text-muted-foreground mb-6">
              By choosing this company, you commit to working with them for a minimum of 3 months. During this period, you will have exclusive access to their tasks and training modules.
            </p>
            
            {activeLock ? (
              <div className="text-sm font-medium p-4 bg-orange-500/10 text-orange-600 rounded-xl">
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
