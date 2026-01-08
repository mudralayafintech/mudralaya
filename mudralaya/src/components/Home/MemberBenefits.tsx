"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gift, TrendingUp, Zap, GraduationCap, ArrowRight } from "lucide-react";
import { useUI } from "@/context/UIContext";
import styles from "./MemberBenefits.module.css";

const MemberBenefits = () => {
  const { openJoinUsModal } = useUI();

  const benefits = [
    {
      id: "01",
      icon: <Gift size={24} />,
      title: "Earn ₹250 Cash",
      description:
        "Get an immediate reward of ₹250 in your Mudralaya Wallet as an early joining bonus.",
    },
    {
      id: "02",
      icon: <TrendingUp size={24} />,
      title: "Extra Earning",
      description:
        "Exclusive access to higher payouts for the same tasks compared to non-members.",
    },
    {
      id: "03",
      icon: <Zap size={24} />,
      title: "High Paying Tasks",
      description:
        "Get priority access to premium, high-paying corporate tasks and surveys.",
    },
    {
      id: "04",
      icon: <GraduationCap size={24} />,
      title: "Free Training",
      description:
        "A comprehensive training course worth ₹10,000 to kickstart your journey.",
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.box}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              Become our early member <br />
              <span className={styles.priceHighlight}>
                <span className={styles.strike}>₹999</span> ₹99/-
              </span>
            </h2>
            <p className={styles.subtitle}>
              Join the waitlist today and unlock exclusive founder member
              benefits. <br />
              <span className={styles.highlight}>Limited time offer!</span>
            </p>
          </div>

          <div className={styles.contentWrapper}>
            {/* Left Side: Illustration */}
            <div className={styles.illustrationCol}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className={styles.imageWrapper}
              >
                <img
                  src="/images/benefits.png"
                  alt="Member Benefits"
                  className={styles.mainImage}
                />
              </motion.div>
            </div>

            {/* Right Side: Benefits Grid */}
            <div className={styles.benefitsCol}>
              <div className={styles.grid}>
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={styles.card}
                  >
                    <div className={styles.cardTop}>
                      <span className={styles.badge}>{benefit.id}</span>
                      <div className={styles.icon}>{benefit.icon}</div>
                    </div>
                    <h4 className={styles.cardTitle}>{benefit.title}</h4>
                    <p className={styles.cardDesc}>{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Join today and start earning immediately!
            </p>
            <button
              className={styles.cta}
              onClick={() => openJoinUsModal("individual")}
            >
              Become our Partner <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MemberBenefits;
