import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return redirect('/login');

  const { data: user } = await supabase
    .from('users')
    .select('city, skills, interests')
    .eq('id', session.user.id)
    .single();

  // If user already onboarded, send to dashboard
  if (user?.city && user?.skills?.length > 0) {
    return redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-xl w-full bg-card rounded-3xl shadow-xl overflow-hidden border">
        <div className="bg-primary/5 p-8 text-center border-b">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Help us tailor the best tasks and dedicated partner opportunities for you.
          </p>
        </div>
        <div className="p-8">
          <OnboardingClient userId={session.user.id} />
        </div>
      </div>
    </div>
  );
}
