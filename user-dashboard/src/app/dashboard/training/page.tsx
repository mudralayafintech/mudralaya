import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DownloadCertificateButton from './DownloadCertificateButton';

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
      <div className="p-6 max-w-5xl mx-auto space-y-8 text-center pt-20">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">No Active Training</h1>
        <p className="text-muted-foreground">You are not currently locked to any partner company.</p>
        <div className="mt-8">
          <Link href="/dashboard/partners" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow hover:bg-primary/90 transition-colors">
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
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {company.name} - Company Specific Training
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold">Modules</h2>
          {modules?.length === 0 ? (
            <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">
              No training modules have been uploaded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {modules?.map((mod, index) => {
                const status = progressMap[mod.id] || 'pending';
                return (
                  <div key={mod.id} className="bg-card border rounded-2xl p-6 flex justify-between items-center transition-all hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-muted flex items-center justify-center rounded-xl font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{mod.title}</h3>
                        <p className={`text-sm mt-1 px-2.5 py-0.5 rounded-full inline-block font-medium ${
                          status === 'completed' ? 'bg-green-500/10 text-green-600' :
                          status === 'in_progress' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {status.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    {/* Placeholder for actual training viewer link */}
                    <button className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-2 rounded-xl transition-colors font-medium">
                      {status === 'completed' ? 'Review' : 'Start'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Your Commitment</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-semibold">{company.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Locked Untill</p>
                <p className="font-semibold">{new Date(activeLock.expires_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`font-semibold capitalize ${isCompleted ? 'text-green-600' : 'text-primary'}`}>
                  {isCompleted ? 'Completed' : 'Active'}
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-primary/10 border-dashed space-y-4">
              <h3 className="font-bold">Completion Certificate</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Available after your 3-month term completes.
              </p>
              {isCompleted ? (
                <DownloadCertificateButton companyId={company.id} />
              ) : (
                <div className="w-full bg-muted text-muted-foreground font-semibold py-3 px-4 rounded-xl text-center cursor-not-allowed">
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
