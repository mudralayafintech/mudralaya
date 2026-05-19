'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export default function DownloadCertificateButton({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'paying' | 'generating' | 'done'>('idle');
  const router = useRouter();
  const supabase = createClient();

  const importRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const generateCertificatePDF = async (userName: string, companyName: string, completionDate: string) => {
    // Generate a certificate PDF using Canvas API + download
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d')!;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 850);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e3a5f');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 850);

    // Gold border
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1140, 790);
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 1110, 760);

    // Corner ornaments
    const drawCorner = (x: number, y: number, scaleX: number, scaleY: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scaleX, scaleY);
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 40);
      ctx.lineTo(0, 0);
      ctx.lineTo(40, 0);
      ctx.stroke();
      ctx.restore();
    };
    drawCorner(50, 50, 1, 1);
    drawCorner(1150, 50, -1, 1);
    drawCorner(50, 800, 1, -1);
    drawCorner(1150, 800, -1, -1);

    // Title
    ctx.fillStyle = '#DAA520';
    ctx.font = 'bold 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '8px';
    ctx.fillText('MUDRALAYA FINTECH PRIVATE LIMITED', 600, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.fillText('Certificate of Completion', 600, 200);

    // Decorative line
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 230);
    ctx.lineTo(900, 230);
    ctx.stroke();

    // "This is to certify that"
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('This is to certify that', 600, 300);

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText(userName || 'Partner', 600, 370);

    // Underline name
    const nameWidth = ctx.measureText(userName || 'Partner').width;
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(600 - nameWidth / 2 - 20, 385);
    ctx.lineTo(600 + nameWidth / 2 + 20, 385);
    ctx.stroke();

    // Description
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px Georgia, serif';
    ctx.fillText('has successfully completed the training program with', 600, 440);
    
    // Company name
    ctx.fillStyle = '#DAA520';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText(companyName || 'Mudralaya Partner Company', 600, 490);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px Georgia, serif';
    ctx.fillText('and demonstrated exceptional commitment and dedication', 600, 540);

    // Date
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Georgia, serif';
    ctx.fillText(`Completion Date: ${completionDate}`, 600, 620);

    // Signature line
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(380, 720);
    ctx.lineTo(820, 720);
    ctx.stroke();

    ctx.fillStyle = '#DAA520';
    ctx.font = '14px Georgia, serif';
    ctx.fillText('Authorized by Mudralaya Fintech Pvt. Ltd.', 600, 750);

    // Certificate ID
    ctx.fillStyle = '#475569';
    ctx.font = '12px monospace';
    ctx.fillText(`Certificate ID: MUDRA-${Date.now().toString(36).toUpperCase()}`, 600, 790);

    // Download as image (PNG)
    const link = document.createElement('a');
    link.download = `Mudralaya_Certificate_${userName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // 1. Request Certificate (creates an unpaid one if it doesn't exist)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/partner-api`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            action: 'request-certificate',
            data: { company_id: companyId }
          })
        }
      );

      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error || 'Failed to request certificate');

      const certificate = result.certificate;

      if (!certificate.is_paid) {
        // Show ₹499 Razorpay payment flow
        setStatus('paying');
        const res = await importRazorpay();
        if (!res) {
          throw new Error('Payment SDK failed to load. Are you online?');
        }

        const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/razorpay-api`;

        // Create order for ₹499 certificate
        const orderRes = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            action: 'create-order',
            data: {
              currency: 'INR',
              receipt: `cert_${companyId}_${Date.now()}`,
              userId: session.user.id,
              planType: 'certificate',
              amount: 499,
            }
          })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create payment order');

        // Open Razorpay Checkout
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Mudralaya Fintech Private Limited',
          description: 'Certificate Fee - ₹499',
          image: '/logo.png',
          order_id: orderData.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async function(paymentResponse: any) {
            try {
              // Verify payment
              const verifyRes = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                  'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                },
                body: JSON.stringify({
                  action: 'verify-payment',
                  data: {
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                    type: 'certificate',
                    userId: session.user.id,
                    certificateId: certificate.id,
                    companyId: companyId,
                    amount: 499,
                  }
                })
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error || 'Payment verification failed');

              // Payment successful — now generate and download certificate
              setStatus('generating');

              // Get user profile for name
              const { data: userData } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', session.user.id)
                .single();

              // Get company name
              const { data: companyData } = await supabase
                .from('companies')
                .select('name')
                .eq('id', companyId)
                .single();

              await generateCertificatePDF(
                userData?.full_name || 'Partner',
                companyData?.name || 'Mudralaya Partner Company',
                new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
              );

              setStatus('done');
              alert('Certificate downloaded successfully! 🎉');

            } catch (err: any) {
              console.error('Payment verification failed:', err);
              setError(err.message || 'Payment verification failed. Contact support.');
              setStatus('idle');
            }
          },
          prefill: {
            contact: session.user.phone || '',
          },
          theme: {
            color: '#DAA520',
          },
        };

        const rzp = new window.Razorpay(options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rzp.on('payment.failed', function(response: any) {
          setError(response.error.description || 'Payment failed');
          setStatus('idle');
        });
        rzp.open();
        setLoading(false);
        return;
      }

      // If already paid, generate and download certificate directly
      setStatus('generating');

      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', session.user.id)
        .single();

      const { data: companyData } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();

      await generateCertificatePDF(
        userData?.full_name || 'Partner',
        companyData?.name || 'Mudralaya Partner Company',
        new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      );

      setStatus('done');
      
    } catch (err: any) {
      console.error('Certificate error:', err);
      setError(err.message || 'Failed to process certificate request');
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (status === 'paying') return 'Processing Payment...';
    if (status === 'generating') return 'Generating Certificate...';
    if (status === 'done') return '✅ Certificate Downloaded';
    if (loading) return 'Processing...';
    return '📜 Request Certificate (₹499)';
  };

  return (
    <div>
      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}
      <button
        onClick={handleDownload}
        disabled={loading || status === 'done'}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
        style={{
          background: status === 'done' ? '#22c55e' : undefined,
        }}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
