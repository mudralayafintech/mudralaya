'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MembershipClient({ 
  userProfile, 
  isCertificate, 
  companyId, 
  userId 
}: { 
  userProfile: any;
  isCertificate: boolean;
  companyId?: string;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async (plan: string, amount: number) => {
    try {
      setLoading(true);
      // Logic for triggering Razorpay goes here
      // For this plan implementation, we mock the Razorpay redirect since razorpay-api needs further frontend integration setup
      // A typical implementation:
      /*
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/razorpay-api`, {
        method: 'POST',
        headers: {
           ...
      */

      alert(`Initiating Razorpay payment for ₹${amount} (${plan})`);
      
      // Simulate successful payment redirect back to dashboard
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);

    } catch (e) {
      console.error(e);
      alert('Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  if (isCertificate) {
    return (
      <div className="flex justify-center mt-12">
        <div className="border bg-card rounded-2xl p-8 max-w-sm w-full shadow-sm text-center">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold">Certificate Fee</h3>
              <p className="text-3xl font-extrabold mt-4">₹499</p>
            </div>
            <button 
              onClick={() => handlePayment('certificate', 499)}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
      {/* Monthly Plan */}
      <div className="border bg-card rounded-2xl p-8 shadow-sm flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold">Monthly</h3>
            <p className="text-sm text-muted-foreground mt-2">Perfect for trying things out.</p>
          </div>
          <p className="text-4xl font-extrabold">₹299 <span className="text-lg text-muted-foreground font-normal">/mo</span></p>
          <ul className="space-y-3 mt-6">
            <li className="flex items-center gap-3">
              <span className="text-green-500">✓</span> Unlock premium daily tasks
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-500">✓</span> Priority support
            </li>
          </ul>
        </div>
        <button 
          onClick={() => handlePayment('monthly', 299)}
          disabled={loading}
          className="mt-8 w-full bg-primary/10 text-primary font-semibold py-3 px-4 rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          Subscribe Monthly
        </button>
      </div>

      {/* Yearly Plan */}
      <div className="border border-primary bg-card rounded-2xl p-8 shadow-lg flex flex-col justify-between relative">
        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
          RECOMMENDED
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-primary">Yearly</h3>
            <p className="text-sm text-muted-foreground mt-2">Best value for dedicated partners.</p>
          </div>
          <p className="text-4xl font-extrabold">₹2499 <span className="text-lg text-muted-foreground font-normal">/yr</span></p>
          <ul className="space-y-3 mt-6">
            <li className="flex items-center gap-3">
              <span className="text-green-500">✓</span> All Monthly benefits
            </li>
            <li className="flex items-center gap-3 font-semibold">
              <span className="text-green-500">✓</span> Instant ₹99 Cashback to Wallet
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-500">✓</span> Specialized Company SOP access
            </li>
          </ul>
        </div>
        <button 
          onClick={() => handlePayment('yearly', 2499)}
          disabled={loading}
          className="mt-8 w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl hover:bg-primary/90 transition-colors shadow shadow-primary/20 disabled:opacity-50"
        >
          Subscribe Yearly
        </button>
      </div>
    </div>
  );
}
