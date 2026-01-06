import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';
import './Plans.css';

const Plans = () => {
    const { profile } = useUser();
    const navigate = useNavigate();
    const [hasLaptop, setHasLaptop] = useState(false);

    const importRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlanSelect = async (plan) => {
        if (plan.id === 1) return; // Free plan (already enrolled)

        if (plan.id === 2) {
            // Individual Plan (25k) -> Direct Purchase
            const res = await importRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                return;
            }

            try {
                // 1. Create Order
                const finalAmount = (plan.id === 2 && hasLaptop) ? 5000 : plan.price;

                const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-api', {
                    body: {
                        action: 'create-order',
                        data: {
                            amount: finalAmount,
                            currency: 'INR',
                            receipt: `plan_ind_${Date.now()}`
                        }
                    }
                });

                if (orderError) throw orderError;
                if (!orderData) throw new Error("No order data returned");

                // 2. Open Razorpay Checkout
                const options = {
                    key: orderData.keyId,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "Mudralaya Fintech",
                    description: `Purchase ${plan.name} Plan`,
                    image: "/logo.png",
                    order_id: orderData.id,
                    handler: async function (response) {
                        try {
                            // 3. Verify Payment
                            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-api', {
                                body: {
                                    action: 'verify-payment',
                                    data: {
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_signature: response.razorpay_signature,
                                        type: 'plan',
                                        userId: profile.id,
                                        plan: 'individual'
                                    }
                                }
                            });

                            if (verifyError) throw verifyError;

                            alert('Plan purchased successfully! Welcome to Individual Plan.');
                            // reload to refresh profile
                            window.location.reload();
                        } catch (err) {
                            console.error("Verification Error:", err);
                            alert(`Verification failed: ${err.message}`);
                        }
                    },
                    prefill: {
                        name: profile?.full_name || "",
                        email: profile?.email_id || "",
                        contact: profile?.mobile_number || ""
                    },
                    theme: {
                        color: "#000000"
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
        } else {
            // Business / Startup -> Contact Support
            alert(`For ${plan.name}, please contact our sales team at support@mudralaya.com for a customized quote.`);
        }
    };

    const plans = [
        {
            id: 1,
            name: 'FREE',
            price: 0,
            features: [
                "Start with zero investment",
                "Access to daily / weekly / monthly tasks",
                "Earn by completing tasks from multiple companies",
                "Flexible work — home or on-field",
                "Unlimited earning potential",
                "Simple onboarding (18+)",
                "Ideal for students, homemakers & part-time earners"
            ],
            type: 'purple',
            badgeType: 'pill',
            hasSeparator: true,
            buttonText: 'ENROLLED ALREADY',
            buttonStyle: 'outline'
        },
        {
            id: 2,
            name: 'INDIVIDUAL',
            price: 25000,
            features: [
                "Maximum task opportunities from top brands & companies",
                "Weekly training sessions",
                "Dedicated Relationship Manager for guidance",
                "Daily review & performance improvement",
                "Fix salary support up to ₹50,000 (performance-based)",
                "Strong digital presence setup",
                "Priority access to high-paying tasks",
                "Fast-track growth to Skilled Partner + Entrepreneur",
                "Up to 25% more discount on referral"
            ],
            type: 'black',
            badgeType: 'wide',
            hasCheckbox: true,
            buttonText: 'CHOOSE PLAN',
            buttonStyle: 'cyan'
        },
        {
            id: 3,
            name: 'BUSINESS SOLUTION',
            price: 0,
            features: [
                "We understand your goals and create custom tasks.",
                "Industry-specific tasks for leads, marketing, and outreach.",
                "Training videos for easy execution.",
                "Verified partners for surveys and follow-ups.",
                "Tech, sales, and service support included.",
                "Affordable, scalable solutions for every business."
            ],
            type: 'purple',
            badgeType: 'wide',
            hasSeparator: true,
            buttonText: 'CHOOSE PLAN',
            buttonStyle: 'black'
        },
        {
            id: 4,
            name: 'STARTUP LAUNCH LAB',
            price: 'Customise',
            features: [
                "Understand your idea and build a tailored business model.",
                "Market research and competitor analysis included.",
                "Branding, tech development, and website/app setup.",
                "Support across ideation, strategy, product, and marketing.",
                "Go-to-market execution with dedicated startup mentor.",
                "End-to-end guidance from idea to launch."
            ],
            type: 'purple',
            badgeType: 'wide',
            hasSeparator: true,
            buttonText: 'CHOOSE PLAN',
            buttonStyle: 'black'
        }
    ];

    return (
        <div className="plans-page">
            <header className="plans-header">
                <h1>Mudralaya Plans</h1>
                <p className="subtitle">Choose a Right and best suitable plan for yourself and join Mudralaya</p>
            </header>

            <div className="plans-grid">
                {plans.map((plan) => (
                    <div key={plan.id} className={`plan-card card-${plan.type}`}>
                        <div className={`plan-badge badge-${plan.badgeType}`}>{plan.name}</div>

                        <div className="plan-price">
                            {plan.price === 'Customise' ? (
                                <><span>₹</span> Customise</>
                            ) : (
                                <><span>₹</span> {(plan.id === 2 && hasLaptop) ? "5,000" : plan.price.toLocaleString()}</>
                            )}
                        </div>

                        <ul className="plan-features">
                            {plan.features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>

                        {plan.hasCheckbox && (
                            <>
                                <div className="separator-line"></div>
                                <label className="laptop-check">
                                    <input
                                        type="checkbox"
                                        checked={hasLaptop}
                                        onChange={(e) => setHasLaptop(e.target.checked)}
                                    />
                                    I have my Own Laptop
                                </label>
                                <div className="separator-line"></div>
                            </>
                        )}

                        {plan.hasSeparator && (
                            <div className="separator-line mb-3"></div>
                        )}

                        <button
                            className={`plan-btn btn-${plan.buttonStyle}`}
                            onClick={() => handlePlanSelect(plan)}
                            disabled={plan.id === 1} // Disable for Free plan if enrolled
                            style={{ cursor: plan.id === 1 ? 'not-allowed' : 'pointer', opacity: plan.id === 1 ? 0.7 : 1 }}
                        >
                            {plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Plans;

