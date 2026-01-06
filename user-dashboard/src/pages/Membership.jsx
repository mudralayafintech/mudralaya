
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { FaArrowRight, FaCrown } from 'react-icons/fa'; // Removed FaChip
import './Membership.css';

const BENEFITS = [
    {
        id: '01',
        title: 'Earn 250 Cash',
        desc: 'Get a reward of 250 in your Mudralaya Wallet as a early joining Bonus.'
    },
    {
        id: '02',
        title: 'Extra Earning',
        desc: "Your will get extra earning for the same task for which other's are getting lesser"
    },
    {
        id: '03',
        title: 'High Paying Task',
        desc: 'You will get free access of high paying task after becoming our member'
    },
    {
        id: '04',
        title: 'Free Training',
        desc: 'A FREE training course worth ₹10,000 to support your journey toward financial independence'
    }
];

const Membership = () => {
    const { profile } = useUser();
    const [billingCycle, setBillingCycle] = useState('yearly'); // 'yearly' or 'monthly'

    const importRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBuyNow = async () => {
        const res = await importRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        const price = billingCycle === 'yearly' ? 999 : 99;

        try {
            // 1. Create Order
            const { data: orderData, error: orderError } = await import('../supabaseClient').then(mod => mod.supabase.functions.invoke('razorpay-api', {
                body: {
                    action: 'create-order',
                    data: {
                        amount: price,
                        currency: 'INR',
                        receipt: `mem_${billingCycle}_${Date.now()}`
                    }
                }
            }));

            if (orderError) throw orderError;
            if (!orderData) throw new Error("No order data returned");

            // 2. Open Razorpay Checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Mudralaya Fintech",
                description: `${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Membership`,
                image: "/logo.png", // Ensure this exists or use a placeholder
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const { data: verifyData, error: verifyError } = await import('../supabaseClient').then(mod => mod.supabase.functions.invoke('razorpay-api', {
                            body: {
                                action: 'verify-payment',
                                data: {
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    type: 'membership',
                                    userId: profile.id,
                                    plan: billingCycle
                                }
                            }
                        }));

                        if (verifyError) throw verifyError;

                        alert('Membership processed successfully! Welcome to Mudralaya Gold.');
                        window.location.reload(); // Reload to fetch new profile data
                    } catch (err) {
                        console.error("Verification Error:", err);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: profile?.full_name || "",
                    email: profile?.email || "", // Assuming email is in profile or we can fetch it
                    contact: profile?.phone || ""
                },
                theme: {
                    color: "#00bcd4"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp1.open();

        } catch (err) {
            console.error("Payment Error:", err);
            alert(`Payment initialization failed: ${err.message || JSON.stringify(err)}`);
        }
    };

    const price = billingCycle === 'yearly' ? 999 : 99;
    const period = billingCycle === 'yearly' ? 'Year' : '30 Days';

    return (
        <div className="membership-page">
            <header className="membership-header">
                <h1>Mudralaya Membership</h1>
                <p className="subtitle">Become our member and Gain these benefits of membership</p>

                <div className="plan-toggle">
                    <button
                        className={`toggle-option ${billingCycle === 'yearly' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('yearly')}
                    >
                        Yearly -20%
                    </button>
                    <button
                        className={`toggle-option ${billingCycle === 'monthly' ? 'active' : ''}`}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Monthly
                    </button>
                </div>
            </header>

            <div className="membership-content">
                {/* Golden Membership Card */}
                <div className="membership-card-container">
                    <div className="golden-card">
                        <div className="card-shine"></div>
                        <div className="card-top">
                            <div className="card-chip">
                                <div className="chip-line"></div>
                                <div className="chip-line"></div>
                                <div className="chip-line"></div>
                                <div className="chip-line"></div>
                            </div>
                            <div className="card-logo">
                                <FaCrown /> <span>Mudralaya</span>
                            </div>
                        </div>
                        <div className="card-body">
                            <span className="membership-label">GOLD MEMBERSHIP</span>
                            <div className="card-number">
                                <span>••••</span> <span>••••</span> <span>••••</span> <span>8842</span>
                            </div>
                        </div>
                        <div className="card-bottom">
                            <div className="card-holder">
                                <span className="label">Card Holder</span>
                                <span className="value">{profile?.full_name || 'Your Name'}</span>
                            </div>
                            <div className="card-expiry">
                                <span className="label">Expires</span>
                                <span className="value">
                                    {profile?.membership_expiry
                                        ? new Date(profile.membership_expiry).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })
                                        : 'MM/YY'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="benefits-grid">
                    {BENEFITS.map((benefit) => (
                        <div className="benefit-card" key={benefit.id}>
                            <div className="benefit-number-box">
                                {benefit.id}
                            </div>
                            <h3 className="benefit-title">{benefit.title}</h3>
                            <p className="benefit-desc">{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="membership-footer">
                <div className="price-text">
                    <span className="price-amount">₹ {price}</span> / {period}
                </div>
                <button className="buy-btn" onClick={handleBuyNow}>
                    Buy Now <FaArrowRight />
                </button>
            </footer>
        </div>
    );
};

export default Membership;
