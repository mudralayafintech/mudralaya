'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './membership.module.css';
import { Check } from 'lucide-react';

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
      <div className={styles.certFeeContainer}>
        <div className={`${styles.card} ${styles.certCard}`}>
          <div className={styles.cardContent}>
            <div>
              <h3 className={styles.planTitle}>Certificate Fee</h3>
              <p className={styles.price} style={{ marginTop: '1rem' }}>₹499</p>
            </div>
            <button 
              onClick={() => handlePayment('certificate', 499)}
              disabled={loading}
              className={styles.buttonPrimary}
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.plansGrid}>
      {/* Monthly Plan */}
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <div>
            <h3 className={styles.planTitle}>Monthly</h3>
            <p className={styles.planDesc}>Perfect for trying things out.</p>
          </div>
          <p className={styles.price}>₹299 <span>/mo</span></p>
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} /> Unlock premium daily tasks
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} /> Priority support
            </li>
          </ul>
        </div>
        <button 
          onClick={() => handlePayment('monthly', 299)}
          disabled={loading}
          className={styles.buttonSecondary}
        >
          Subscribe Monthly
        </button>
      </div>

      {/* Yearly Plan */}
      <div className={`${styles.card} ${styles.recommendedCard}`}>
        <div className={styles.recommendedBadge}>
          RECOMMENDED
        </div>
        <div className={styles.cardContent}>
          <div>
            <h3 className={`${styles.planTitle} ${styles.primaryText}`}>Yearly</h3>
            <p className={styles.planDesc}>Best value for dedicated partners.</p>
          </div>
          <p className={styles.price}>₹2499 <span>/yr</span></p>
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} /> All Monthly benefits
            </li>
            <li className={`${styles.featureItem} ${styles.highlight}`}>
              <Check size={18} className={styles.checkIcon} /> Instant ₹99 Cashback to Wallet
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} /> Specialized Company SOP access
            </li>
          </ul>
        </div>
        <button 
          onClick={() => handlePayment('yearly', 2499)}
          disabled={loading}
          className={styles.buttonPrimary}
        >
          Subscribe Yearly
        </button>
      </div>
    </div>
  );
}
