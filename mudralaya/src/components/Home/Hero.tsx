"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useUI } from "@/context/UIContext";
import styles from "./Hero.module.css";

const Hero = () => {
  const { openJoinUsModal } = useUI();

  return (
    <section className={styles.hero}>
      {/* Background Orbs for Premium Look */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className="container">
        <div className={styles.grid}>
          {/* Left Content */}
          <div className={styles.content}>
            <div className={styles.badge}>
              <CheckCircle2 size={16} className={styles.badgeIcon} />
              <span>Flexible work</span>
            </div>

            <h1 className={styles.headline}>
              Choose Your Tasks. <br />
              <span className={styles.gradientText}>Real income</span> <br />
               Long-term growth
            </h1>

            <p className={styles.subheadline}>
              India’s Trusted Partner-Based Earning & Business Ecosystem
              Connecting B2B companies with verified local partners to create real, scam-free earning opportunities across Tier 2 & Tier 3 India.

            </p>

            <div className={styles.actions}>
              <button
                className={styles.primaryBtn}
                onClick={() => openJoinUsModal()}
              >
                Join as a Partner
                <ArrowRight size={20} />
              </button>
              <Link href="/contact" className={styles.secondaryBtn}>
                Partner with Us – B2B
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className={styles.imageWrapper}
          >
            <div className={styles.imageInner}>
              <Image
                src="/images/team.png"
                alt="Business Professionals"
                width={650}
                height={760}
                quality={85}
                priority
                className={styles.image}
              />
              {/* Floating Floating Elements */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={styles.floatingCard}
              >
                <div className={styles.cardDot} />
                <span>Earnings: ₹24,500</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
