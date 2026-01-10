"use client";

import React, { useState, useEffect } from "react";
import Skeleton from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";
import styles from "./plans.module.css";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  id: number;
  name: string;
  price: number | "Customise";
  features: string[];
  type: string;
  badgeType: string;
  hasSeparator?: boolean;
  buttonText: string;
  buttonStyle: string;
  hasCheckbox?: boolean;
}

export default function Plans() {
  const [profile, setProfile] = useState<any>(null);
  const [hasLaptop, setHasLaptop] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileData) {
        setProfile(profileData);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.plansPage}>
        <header className={styles.plansHeader}>
          <Skeleton width={300} height={36} style={{ marginBottom: 16 }} />
          <Skeleton width={400} height={20} />
        </header>

        <div className={styles.plansGrid}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={320} height={650} borderRadius={36} />
          ))}
        </div>
      </div>
    );
  }

  const importRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.id === 1) return; // Free plan (already enrolled)

    if (plan.id === 2) {
      // Individual Plan (25k) -> Direct Purchase
      const res = await importRazorpay();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      try {
        // 1. Create Order
        const finalAmount =
          plan.id === 2 && hasLaptop
            ? 5000
            : typeof plan.price === "number"
            ? plan.price
            : 0;

        const { data: orderData, error: orderError } =
          await supabase.functions.invoke("razorpay-api", {
            body: {
              action: "create-order",
              data: {
                amount: finalAmount,
                currency: "INR",
                receipt: `plan_ind_${Date.now()}`,
              },
            },
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
          handler: async function (response: any) {
            try {
              // 3. Verify Payment
              const { error: verifyError } = await supabase.functions.invoke(
                "razorpay-api",
                {
                  body: {
                    action: "verify-payment",
                    data: {
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_signature: response.razorpay_signature,
                      type: "plan",
                      userId: user?.id,
                      plan: "individual",
                    },
                  },
                }
              );

              if (verifyError) throw verifyError;

              alert("Plan purchased successfully! Welcome to Individual Plan.");
              // reload to refresh profile
              window.location.reload();
            } catch (err: any) {
              console.error("Verification Error:", err);
              alert(`Verification failed: ${err.message}`);
            }
          },
          prefill: {
            name: profile?.full_name || "",
            email: profile?.email_id || "",
            contact: user?.phone || profile?.mobile_number || "",
          },
          theme: {
            color: "#000000",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on("payment.failed", function (response: any) {
          alert(response.error.description);
        });
        rzp1.open();
      } catch (err: any) {
        console.error("Payment Error:", err);
        alert(
          `Payment initialization failed: ${err.message || JSON.stringify(err)}`
        );
      }
    } else {
      // Business / Startup -> Contact Support
      alert(
        `For ${plan.name}, please contact our sales team at support@mudralaya.com for a customized quote.`
      );
    }
  };

  const plans: Plan[] = [
    {
      id: 1,
      name: "FREE",
      price: 0,
      features: [
        "Start with zero investment",
        "Access to daily / weekly / monthly tasks",
        "Earn by completing tasks from multiple companies",
        "Flexible work — home or on-field",
        "Unlimited earning potential",
        "Simple onboarding (18+)",
        "Ideal for students, homemakers & part-time earners",
      ],
      type: "purple",
      badgeType: "pill",
      hasSeparator: true,
      buttonText: "ENROLLED ALREADY",
      buttonStyle: "outline",
    },
    {
      id: 2,
      name: "INDIVIDUAL",
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
        "Up to 25% more discount on referral",
      ],
      type: "black",
      badgeType: "wide",
      hasCheckbox: true,
      buttonText: "CHOOSE PLAN",
      buttonStyle: "cyan",
    },
    {
      id: 3,
      name: "BUSINESS SOLUTION",
      price: 0,
      features: [
        "We understand your goals and create custom tasks.",
        "Industry-specific tasks for leads, marketing, and outreach.",
        "Training videos for easy execution.",
        "Verified partners for surveys and follow-ups.",
        "Tech, sales, and service support included.",
        "Affordable, scalable solutions for every business.",
      ],
      type: "purple",
      badgeType: "wide",
      hasSeparator: true,
      buttonText: "CHOOSE PLAN",
      buttonStyle: "black",
    },
    {
      id: 4,
      name: "STARTUP LAUNCH LAB",
      price: "Customise",
      features: [
        "Understand your idea and build a tailored business model.",
        "Market research and competitor analysis included.",
        "Branding, tech development, and website/app setup.",
        "Support across ideation, strategy, product, and marketing.",
        "Go-to-market execution with dedicated startup mentor.",
        "End-to-end guidance from idea to launch.",
      ],
      type: "purple",
      badgeType: "wide",
      hasSeparator: true,
      buttonText: "CHOOSE PLAN",
      buttonStyle: "black",
    },
  ];

  // Helper to map type strings to styles keys
  const getCardStyle = (type: string) => {
    switch (type) {
      case "purple":
        return styles.cardPurple;
      case "black":
        return styles.cardBlack;
      default:
        return "";
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "pill":
        return styles.badgePill;
      case "wide":
        return styles.badgeWide;
      default:
        return "";
    }
  };

  const getButtonStyle = (type: string) => {
    switch (type) {
      case "outline":
        return styles.btnOutline;
      case "cyan":
        return styles.btnCyan;
      case "black":
        return styles.btnBlack;
      default:
        return "";
    }
  };

  return (
    <div className={styles.plansPage}>
      <header className={styles.plansHeader}>
        <h1>Mudralaya Plans</h1>
        <p className={styles.subtitle}>
          Choose a Right and best suitable plan for yourself and join Mudralaya
        </p>
      </header>

      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`${styles.planCard} ${getCardStyle(plan.type)}`}
          >
            <div
              className={`${styles.planBadge} ${getBadgeStyle(plan.badgeType)}`}
            >
              {plan.name}
            </div>

            <div className={styles.planPrice}>
              {plan.price === "Customise" ? (
                <>
                  <span>₹</span> Customise
                </>
              ) : (
                <>
                  <span>₹</span>{" "}
                  {plan.id === 2 && hasLaptop
                    ? "5,000"
                    : plan.price.toLocaleString()}
                </>
              )}
            </div>

            <ul className={styles.planFeatures}>
              {plan.features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            {plan.hasCheckbox && (
              <>
                <div className={styles.separatorLine}></div>
                <label className={styles.laptopCheck}>
                  <input
                    type="checkbox"
                    checked={hasLaptop}
                    onChange={(e) => setHasLaptop(e.target.checked)}
                  />
                  I have my Own Laptop
                </label>
                <div className={styles.separatorLine}></div>
              </>
            )}

            {plan.hasSeparator && (
              <div className={`${styles.separatorLine} ${styles.mb3}`}></div>
            )}

            <button
              className={`${styles.planBtn} ${getButtonStyle(
                plan.buttonStyle
              )}`}
              onClick={() => handlePlanSelect(plan)}
              disabled={plan.id === 1}
              style={{
                cursor: plan.id === 1 ? "not-allowed" : "pointer",
                opacity: plan.id === 1 ? 0.7 : 1,
              }}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
