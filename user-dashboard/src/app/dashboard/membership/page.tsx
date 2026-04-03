import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MembershipClient from './MembershipClient';

export const dynamic = 'force-dynamic';

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: { type?: string; companyId?: string };
}) {
  const supabase = await createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return redirect('/login');

  const { data: userProfile } = await supabase
    .from('users')
    .select('membership_type, membership_expiry')
    .eq('id', session.user.id)
    .single();

  const isCertificatePayment = searchParams.type === 'certificate';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {isCertificatePayment ? (
        <div className="text-center space-y-4 pt-12">
          <h1 className="text-3xl font-bold">Certificate Processing Fee</h1>
          <p className="text-muted-foreground text-lg">
            Pay a one-time fee of ₹499 to issue your verified experience certificate.
          </p>
        </div>
      ) : (
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold tracking-tight">Upgrade Your Earning Potential</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get access to premium tasks, eliminate withdrawal fees, and earn a flat ₹99 cashback instantly on the Yearly plan.
          </p>
        </div>
      )}

      {/* Render the Client Component which will handle the Razorpay trigger */}
      <MembershipClient 
        userProfile={userProfile} 
        isCertificate={isCertificatePayment}
        companyId={searchParams.companyId}
        userId={session.user.id}
      />
    </div>
  );
}
