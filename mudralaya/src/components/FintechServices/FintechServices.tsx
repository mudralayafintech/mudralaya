"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants, type Easing } from "framer-motion";
import {
  ArrowRight,
  Smartphone,
  TrendingUp,
  Shield,
  BarChart2,
  Zap,
  Globe,
  Users,
  Building2,
  CheckCircle2,
  Landmark,
  Coins,
  Cpu,
} from "lucide-react";
import { useUI } from "@/context/UIContext";
import styles from "./FintechServices.module.css";

const easeOut: Easing = "easeOut";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: easeOut },
  }),
};

const growthPoints = [
  {
    icon: <Smartphone size={20} />,
    text: "Digital lending platforms offer instant loans without paperwork",
  },
  {
    icon: <Building2 size={20} />,
    text: "Neo-banks and wallets provide seamless banking",
  },
  {
    icon: <Shield size={20} />,
    text: "Insurtech delivers affordable health and life cover via apps",
  },
  {
    icon: <BarChart2 size={20} />,
    text: "Investment apps democratize mutual funds, stocks, and gold",
  },
  {
    icon: <Cpu size={20} />,
    text: "Wealthtech tools help manage portfolios with AI insights",
  },
];

const investmentReasons = [
  {
    icon: <Users size={20} />,
    text: "Massive untapped market: 1.4 billion people, many underbanked",
  },
  {
    icon: <TrendingUp size={20} />,
    text: "High growth trajectory: Strong recovery post-funding winter, with equity funding surging",
  },
  {
    icon: <Globe size={20} />,
    text: "Proven unicorns: Multiple fintech giants valued in billions",
  },
  {
    icon: <Landmark size={20} />,
    text: "Regulatory tailwinds: RBI's sandbox, open banking initiatives",
  },
  {
    icon: <Zap size={20} />,
    text: "Tech advantage: Low-cost innovation, AI/ML, blockchain integration",
  },
];

const keyAreas = [
  {
    icon: <Smartphone size={26} />,
    title: "Payments & UPI Ecosystem",
    desc: "Continued dominance and new features like UPI for feature phones.",
    color: "blue",
  },
  {
    icon: <Coins size={26} />,
    title: "Lending & Credit",
    desc: "MSME, personal, buy-now-pay-later models fuelling credit access.",
    color: "green",
  },
  {
    icon: <BarChart2 size={26} />,
    title: "Wealth & Investment",
    desc: "Robo-advisors, fractional investing, and AI-powered portfolios.",
    color: "purple",
  },
  {
    icon: <Shield size={26} />,
    title: "Insurtech",
    desc: "Micro-insurance, health tech bundles making cover accessible.",
    color: "orange",
  },
  {
    icon: <CheckCircle2 size={26} />,
    title: "RegTech & Compliance",
    desc: "Tools for seamless KYC, fraud detection, and smart compliance.",
    color: "teal",
  },
];

const stats = [
  { value: "₹1T+", label: "Market size by 2030" },
  { value: "1.4B", label: "Population opportunity" },
  { value: "#1", label: "Global UPI transactions" },
];

const FintechServices = () => {
  const { openJoinUsModal } = useUI();

  return (
    <div className={styles.page}>

      {/* ─── Hero ─── */}
      <section className={styles.hero}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className="container">
          <div className={styles.heroGrid}>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={styles.heroContent}
            >
              <div className={styles.badge}>
                <Zap size={14} className={styles.badgeIcon} />
                <span>Fintech Financial Services in India</span>
              </div>

              <h1 className={styles.heroTitle}>
                India&apos;s Fintech Revolution:{" "}
                <span className={styles.gradientText}>Where Innovation</span>{" "}
                Meets Everyday Money
              </h1>

              <p className={styles.heroDesc}>
                From street vendors accepting UPI QR codes to millions banking
                on phones, fintech financial services in India have rewritten
                how Indians handle money. What started as digital payments has
                exploded into lending, insurance, investments, wealth
                management, and more – making finance{" "}
                <strong>faster, cheaper, and inclusive</strong> for crores.
              </p>

              <div className={styles.heroActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => openJoinUsModal()}
                >
                  Join the Revolution
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className={styles.statsRow}>
                {stats.map((s, i) => (
                  <div key={i} className={styles.statItem}>
                    <span className={styles.statValue}>{s.value}</span>
                    <span className={styles.statLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className={styles.heroImageWrapper}
            >
              <Image
                src="/images/indiaFinancialService/247cdacb-f3dc-498a-9d84-bc3e3edafb45.jpg"
                alt="Fintech financial services in India"
                width={580}
                height={480}
                priority
                className={styles.heroImg}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Growth Section ─── */}
      <section className={styles.growthSection}>
        <div className="container">
          <div className={styles.twoColLeft}>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.growthImageWrapper}
            >
              <Image
                src="/images/indiaFinancialService/2e557607-50de-4a2d-ae22-02d29958af41.png"
                alt="Explosive growth of fintech in India"
                width={540}
                height={420}
                className={styles.sectionImg}
              />
              <div className={styles.floatBadge}>
                <CheckCircle2 size={16} className={styles.floatIcon} />
                <span>Billions of UPI transactions monthly</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className={styles.growthContent}
            >
              <h2 className={styles.sectionTitle}>
                The Explosive Growth of{" "}
                <span className={styles.accent}>Fintech Financial Services</span>{" "}
                in India
              </h2>
              <p className={styles.sectionSub}>
                India leads the world in digital payments thanks to UPI, with
                billions of transactions monthly transforming small shops,
                kirana stores, and even rural areas. This boom bridges
                urban-rural divides, empowers women and youth, and drives
                financial inclusion at scale. The sector is projected to reach
                massive revenues by 2030, fueled by smartphone penetration,
                Aadhaar, and supportive regulations.
              </p>
              <ul className={styles.pointList}>
                {growthPoints.map((p, i) => (
                  <motion.li
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className={styles.pointItem}
                  >
                    <span className={styles.pointIcon}>{p.icon}</span>
                    <span>{p.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Investment Section ─── */}
      <section className={styles.investSection}>
        <div className="container">
          <div className={styles.twoColRight}>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.investContent}
            >
              <h2 className={styles.sectionTitle}>
                Why Fintech Investment in India Is One of the{" "}
                <span className={styles.accent}>Hottest Opportunities</span>
              </h2>
              <p className={styles.sectionSub}>
                Investors are pouring in billions because of India&apos;s
                unmatched scale, digital infrastructure, and regulatory
                momentum. From seed to late-stage, opportunities abound in
                payments, lending, insurtech, wealthtech, and embedded
                finance. Early investors see high returns as startups scale
                nationally and globally.
              </p>
              <ul className={styles.pointList}>
                {investmentReasons.map((p, i) => (
                  <motion.li
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className={styles.pointItem}
                  >
                    <span className={styles.pointIconGreen}>{p.icon}</span>
                    <span>{p.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className={styles.investImageWrapper}
            >
              <Image
                src="/images/indiaFinancialService/362330a6-bfc5-40eb-b234-b0b9685d9d8b.jpg"
                alt="Fintech investment opportunities in India"
                width={540}
                height={420}
                className={styles.sectionImg}
              />
              <div className={styles.floatBadgeGreen}>
                <TrendingUp size={16} className={styles.floatIconGreen} />
                <span>Multiple billion-dollar unicorns</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Key Areas ─── */}
      <section className={styles.areasSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Key Areas Driving{" "}
              <span className={styles.accent}>Fintech Investment in India</span>
            </h2>
            <p className={styles.sectionSub}>
              With strong investor interest from global and domestic funds,
              the ecosystem is ripe for breakthroughs across every vertical.
            </p>
          </div>

          <div className={styles.areasLayout}>
            <div className={styles.areasGrid}>
              {keyAreas.map((area, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className={`${styles.areaCard} ${styles[`areaCard_${area.color}`]}`}
                >
                  <div className={`${styles.areaIconBox} ${styles[`areaIcon_${area.color}`]}`}>
                    {area.icon}
                  </div>
                  <h4 className={styles.areaTitle}>{area.title}</h4>
                  <p className={styles.areaDesc}>{area.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.areasImageWrapper}
            >
              <Image
                src="/images/indiaFinancialService/6468fc87-b5a1-433e-9241-2313a3bab1a9.png"
                alt="Key fintech verticals in India"
                width={520}
                height={480}
                className={styles.areasImg}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className={styles.cta}>
        <div className={styles.ctaOrb} />
        <div className="container">
          <div className={styles.ctaLayout}>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.ctaContent}
            >
              <div className={styles.ctaIconRow}>
                <Globe size={36} className={styles.ctaIcon} />
              </div>
              <h2 className={styles.ctaTitle}>
                Join the{" "}
                <span className={styles.ctaAccent}>Future of Finance</span>{" "}
                in India
              </h2>
              <p className={styles.ctaDesc}>
                Fintech financial services in India aren&apos;t just
                disrupting banks – they&apos;re creating inclusive, efficient,
                and innovative financial access for everyone.
              </p>
              <div className={styles.ctaActions}>
                <button
                  className={styles.ctaBtn}
                  onClick={() => openJoinUsModal()}
                >
                  Get Started with Mudralaya
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className={styles.ctaImageWrapper}
            >
              <Image
                src="/images/indiaFinancialService/c87564dc-af7e-4e7c-b57e-24a4a0d787a9.jpg"
                alt="India fintech future"
                width={500}
                height={380}
                className={styles.ctaImg}
              />
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FintechServices;
