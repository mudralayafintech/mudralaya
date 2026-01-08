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
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={styles.content}
          >
            <div className={styles.badge}>
              <CheckCircle2 size={16} className={styles.badgeIcon} />
              <span>100% TRUSTED PLATFORM</span>
            </div>

            <h1 className={styles.headline}>
              Choose Your Tasks. <br />
              <span className={styles.gradientText}>Earn Your Way.</span> <br />
              Zero Investment.
            </h1>

            <p className={styles.subheadline}>
              Get daily, weekly & monthly tasks from multiple companies—select
              what suits you and start earning instantly. Join the revolution
              today.
            </p>

            <div className={styles.actions}>
              <button
                className={styles.primaryBtn}
                onClick={() => openJoinUsModal()}
              >
                Become Our Partner
                <ArrowRight size={20} />
              </button>
              <Link href="/contact" className={styles.secondaryBtn}>
                Talk to our Advisor
              </Link>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className={styles.imageWrapper}
          >
            <div className={styles.imageInner}>
              <img
                src="/images/banner-2.png"
                alt="Business Professionals"
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
