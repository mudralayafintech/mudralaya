"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Crown, Loader2 } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";
import styles from "./membership.module.css";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const BENEFITS = [
  {
    id: "01",
    title: "Earn 250 Cash",
    desc: "Get a reward of 250 in your Mudralaya Wallet as a early joining Bonus.",
  },
  {
    id: "02",
    title: "Extra Earning",
    desc: "Your will get extra earning for the same task for which other's are getting lesser",
  },
  {
    id: "03",
    title: "High Paying Task",
    desc: "You will get free access of high paying task after becoming our member",
  },
  {
    id: "04",
    title: "Free Training",
    desc: "A FREE training course worth ₹10,000 to support your journey toward financial independence",
  },
];

export default function Membership() {
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">(
    "yearly"
  );
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
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

  const importRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyNow = async () => {
    const res = await importRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const price = billingCycle === "yearly" ? 999 : 99;

    try {
      // 1. Create Order
      const { data: orderData, error: orderError } =
        await supabase.functions.invoke("razorpay-api", {
          body: {
            action: "create-order",
            data: {
              amount: price,
              currency: "INR",
              receipt: `mem_${billingCycle}_${Date.now()}`,
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
        description: `${
          billingCycle === "yearly" ? "Yearly" : "Monthly"
        } Membership`,
        image: "/logo.png",
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const { error: verifyError } = await supabase.functions.invoke(
              "razorpay-api",
              {
                body: {
                  action: "verify-payment",
                  data: {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    type: "membership",
                    userId: user?.id,
                    plan: billingCycle,
                  },
                },
              }
            );

            if (verifyError) throw verifyError;

            alert(
              "Membership processed successfully! Welcome to Mudralaya Gold."
            );
            window.location.reload(); // Reload to fetch new profile data
          } catch (err) {
            console.error("Verification Error:", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: profile?.full_name || "",
          email: profile?.email_id || "",
          contact: user?.phone || profile?.mobile_number || "",
        },
        theme: {
          color: "#00bcd4",
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
  };

  const price = billingCycle === "yearly" ? 999 : 99;
  const period = billingCycle === "yearly" ? "Year" : "30 Days";

  if (loading && !profile)
    return (
      <div className={styles.membershipPage}>
        <header className={styles.membershipHeader}>
          <Skeleton width={300} height={36} style={{ marginBottom: 16 }} />
          <Skeleton width={400} height={20} style={{ marginBottom: 30 }} />
          <div className={styles.planToggle}>
            <Skeleton width={200} height={40} borderRadius={50} />
          </div>
        </header>

        <div className={styles.membershipContent}>
          <div className={styles.membershipCardContainer}>
            <Skeleton width="100%" height={240} borderRadius={26} />
          </div>

          <div className={styles.benefitsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="100%" height={180} borderRadius={20} />
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.membershipPage}>
      <header className={styles.membershipHeader}>
        <h1>Mudralaya Membership</h1>
        <p className={styles.subtitle}>
          Become our member and Gain these benefits of membership
        </p>

        <div className={styles.planToggle}>
          <button
            className={`${styles.toggleOption} ${
              billingCycle === "yearly" ? styles.active : ""
            }`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly -20%
          </button>
          <button
            className={`${styles.toggleOption} ${
              billingCycle === "monthly" ? styles.active : ""
            }`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
        </div>
      </header>

      <div className={styles.membershipContent}>
        {/* Golden Membership Card */}
        <div className={styles.membershipCardContainer}>
          <div className={styles.goldenCard}>
            <div className={styles.cardShine}></div>
            <div className={styles.cardTop}>
              <div className={styles.cardChip}>
                <div className={styles.chipLine}></div>
                <div className={styles.chipLine}></div>
                <div className={styles.chipLine}></div>
                <div className={styles.chipLine}></div>
              </div>
              <div className={styles.cardLogo}>
                <Crown /> <span>Mudralaya</span>
              </div>
            </div>
            <div className="card-body">
              <span className={styles.membershipLabel}>GOLD MEMBERSHIP</span>
              <div className={styles.cardNumber}>
                <span>••••</span> <span>••••</span> <span>••••</span>{" "}
                <span>8842</span>
              </div>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.cardHolder}>
                <span className={styles.label}>Card Holder</span>
                <span className={styles.value}>
                  {profile?.full_name || "Your Name"}
                </span>
              </div>
              <div className={styles.cardExpiry}>
                <span className={styles.label}>Expires</span>
                <span className={styles.value}>
                  {profile?.membership_expiry
                    ? new Date(profile.membership_expiry).toLocaleDateString(
                        "en-US",
                        { month: "2-digit", year: "2-digit" }
                      )
                    : "MM/YY"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.benefitsGrid}>
          {BENEFITS.map((benefit) => (
            <div className={styles.benefitCard} key={benefit.id}>
              <div className={styles.benefitNumberBox}>{benefit.id}</div>
              <h3 className={styles.benefitTitle}>{benefit.title}</h3>
              <p className={styles.benefitDesc}>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.membershipFooter}>
        <div className={styles.priceText}>
          <span className={styles.priceAmount}>₹ {price}</span> / {period}
        </div>
        <button className={styles.buyBtn} onClick={handleBuyNow}>
          Buy Now <ArrowRight />
        </button>
      </footer>
    </div>
  );
}
