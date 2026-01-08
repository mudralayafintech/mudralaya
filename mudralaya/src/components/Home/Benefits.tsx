"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Laptop as LaptopIcon, Info } from "lucide-react";
import { useUI } from "@/context/UIContext";
import styles from "./Benefits.module.css";

const plans = [
  {
    key: "free",
    title: "FREE",
    price: "₹0",
    benefits: [
      "Start with zero investment",
      "Access to daily / weekly / monthly tasks",
      "Earn by completing tasks from multiple companies",
      "Flexible work — home or on-field",
      "Unlimited earning potential",
      "Simple onboarding (18+)",
      "Ideal for students & homemakers",
    ],
    accent: "#64748b",
  },
  {
    key: "individual",
    title: "INDIVIDUAL",
    price: "₹25,000",
    discountPrice: "₹5,000",
    benefits: [
      "Maximum opportunities from top brands",
      "Weekly training sessions",
      "Dedicated Relationship Manager",
      "Fix salary support up to ₹50,000*",
      "Strong digital presence setup",
      "Priority access to high-paying tasks",
      "Fast-track growth path",
    ],
    accent: "var(--primary)",
    featured: true,
  },
  {
    key: "business-solution",
    title: "BUSINESS",
    price: "₹0",
    benefits: [
      "Customized tasks based on goals",
      "Industry-specific lead generation",
      "Training videos for execution",
      "Verified partners for surveys",
      "Tech & sales support included",
      "Scalable solutions for businesses",
    ],
    accent: "#0f172a",
  },
  {
    key: "startup-launch-lab",
    title: "STARTUP",
    price: "Custom",
    benefits: [
      "Tailored business model building",
      "Market & competitor analysis",
      "Branding & tech development",
      "Ideation to launch support",
      "Dedicated startup mentor",
      "End-to-end guidance",
    ],
    accent: "#7c3aed",
  },
];

const Benefits = () => {
  const [hasLaptop, setHasLaptop] = useState(false);
  const { openJoinUsModal } = useUI();

  const handleChoosePlan = (planKey: string, price: string) => {
    openJoinUsModal(planKey, {
      hasLaptop: planKey === "individual" && hasLaptop,
    });
  };

  return (
    <section id="plans" className={styles.benefits}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Flexible Plans for Your Journey</h2>
          <p className={styles.subtitle}>
            Choose a path that aligns with your entrepreneurial dreams
          </p>
        </div>

        <div className={styles.grid}>
          {plans.map((plan) => {
            const currentPrice =
              plan.key === "individual" && hasLaptop
                ? plan.discountPrice
                : plan.price;

            return (
              <motion.div
                key={plan.key}
                whileHover={{ y: -10 }}
                className={`${styles.card} ${
                  plan.featured ? styles.featured : ""
                }`}
                style={{ "--accent": plan.accent } as React.CSSProperties}
              >
                {plan.featured && (
                  <div className={styles.featuredBadge}>Most Popular</div>
                )}

                <div className={styles.cardHeader}>
                  <h3 className={styles.planTitle}>{plan.title}</h3>
                  <div className={styles.priceWrapper}>
                    <span className={styles.price}>{currentPrice}</span>
                    {/* /onetime removed as requested */}
                  </div>
                </div>

                {plan.key === "individual" && (
                  <div className={styles.laptopOption}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={hasLaptop}
                        onChange={(e) => setHasLaptop(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>
                        <LaptopIcon size={16} /> I have a laptop
                      </span>
                    </label>
                    {hasLaptop && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className={styles.laptopHint}
                      >
                        <Info size={12} /> Special discount applied!
                      </motion.p>
                    )}
                  </div>
                )}

                <ul className={styles.benefitList}>
                  {plan.benefits.map((benefit, i) => (
                    <li key={i} className={styles.benefitItem}>
                      <Check size={16} className={styles.checkIcon} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleChoosePlan(plan.key, currentPrice!)}
                  className={`${styles.cta} ${
                    plan.featured ? styles.ctaPrimary : styles.ctaSecondary
                  }`}
                >
                  Choose {plan.title}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
