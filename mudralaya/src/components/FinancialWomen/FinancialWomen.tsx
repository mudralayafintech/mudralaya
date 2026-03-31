"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants, type Easing } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Heart,
  TrendingUp,
  PiggyBank,
  BookOpen,
  BarChart2,
  Umbrella,
  Layers,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { useUI } from "@/context/UIContext";
import styles from "./FinancialWomen.module.css";

const easeOut: Easing = "easeOut";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.09, ease: easeOut },
  }),
};

const challenges = [
  "Longer life expectancy → more years to fund",
  "Career breaks for family → interrupted income & savings",
  "Gender pay gap → lower lifetime earnings",
  "Higher healthcare costs in later years",
  "Societal expectations to prioritize others first",
];

const buildingBlocks = [
  {
    icon: <BarChart2 size={22} />,
    title: "Own Your Numbers",
    desc: "Track income, expenses, assets, and liabilities. Knowledge is power.",
  },
  {
    icon: <PiggyBank size={22} />,
    title: "Build Emergency & Freedom Funds",
    desc: "6–12 months of living expenses gives real choices.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Master Smart Investing",
    desc: "Mutual funds via SIPs, stocks, gold, PPF, NPS—start small, stay consistent.",
  },
  {
    icon: <Umbrella size={22} />,
    title: "Protect What You Build",
    desc: "Health insurance, term life cover, critical illness plans—non-negotiable.",
  },
  {
    icon: <Layers size={22} />,
    title: "Create Multiple Income Streams",
    desc: "Salary + side hustle + passive income = faster independence.",
  },
  {
    icon: <CalendarCheck size={22} />,
    title: "Plan for Big Life Moments",
    desc: "Marriage, children, home, retirement—proactive beats reactive.",
  },
  {
    icon: <BookOpen size={22} />,
    title: "Learn Continuously",
    desc: "Financial literacy compounds faster than any investment.",
  },
];

const myths = [
  {
    myth: "\"I don't earn enough to invest\"",
    reality: "Even ₹500/month via SIP grows powerfully over time.",
  },
  {
    myth: "\"My husband/parents handle money\"",
    reality: "Joint decisions are great; sole dependence is risky.",
  },
  {
    myth: "\"Investing is too complicated/risky\"",
    reality: "Education + disciplined approach makes it manageable.",
  },
  {
    myth: "\"It's too late for me\"",
    reality: "Any age is the right age to start.",
  },
];

const FinancialWomen = () => {
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
                <Sparkles size={14} className={styles.badgeIcon} />
                <span>Financial Independence for Women</span>
              </div>

              <h1 className={styles.heroTitle}>
                Financial Independence for Women
              </h1>

              <p className={styles.heroDesc}>
                Financial independence for women isn&apos;t a luxury—it&apos;s
                a necessity in a world where life can change in an instant.
                Whether it&apos;s stepping away from a toxic relationship,
                supporting your family without stress, pursuing your passion,
                or simply sleeping peacefully knowing your future is secure,
                true freedom starts with <strong>financial control in your
                own hands</strong>.
              </p>

              <div className={styles.heroActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => openJoinUsModal()}
                >
                  Start Your Journey
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className={styles.heroImageWrapper}
            >
              <Image
                src="/images/women.png"
                alt="Women achieving financial independence"
                width={580}
                height={520}
                priority
                className={styles.heroImg}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Why It Matters ─── */}
      <section className={styles.whySection}>
        <div className="container">
          <div className={styles.twoCol}>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.whyImageWrapper}
            >
              <Image
                src="/images/Empowering_Women.webp"
                alt="Empowering women through financial literacy"
                width={540}
                height={420}
                className={styles.whyImg}
              />
              <div className={styles.impactCard}>
                <Heart size={18} className={styles.impactIcon} />
                <span>
                  Stronger households · Educated children ·{" "}
                  <strong>Generational change</strong>
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.whyContent}
            >
              <h2 className={styles.sectionTitle}>
                Women and Financial Independence
              </h2>
              <p className={styles.sectionSub}>
                Women often face unique financial realities. Yet when women
                take charge of money, the impact ripples outward—creating not
                just personal security, but generational change.
              </p>

              <ul className={styles.challengeList}>
                {challenges.map((c, i) => (
                  <motion.li
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className={styles.challengeItem}
                  >
                    <XCircle size={18} className={styles.challengeIcon} />
                    <span>{c}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── Building Blocks ─── */}
      <section className={styles.blocksSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              The Building Blocks of{" "}
              <span className={styles.accent}>Lasting Financial Freedom</span>
            </h2>
            <p className={styles.sectionSub}>
              Start wherever you are—here&apos;s what actually moves the
              needle. No fancy background or huge starting capital needed—just
              consistent, informed action.
            </p>
          </div>

          <div className={styles.blocksGrid}>
            {buildingBlocks.map((block, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={styles.blockCard}
              >
                <div className={styles.blockIconBox}>{block.icon}</div>
                <div>
                  <h4 className={styles.blockTitle}>{block.title}</h4>
                  <p className={styles.blockDesc}>{block.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Myths Section ─── */}
      <section className={styles.mythsSection}>
        <div className="container">
          <div className={styles.mythsLayout}>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.mythsContent}
            >
              <h2 className={styles.sectionTitle}>
                Common Myths Keeping Women from{" "}
                <span className={styles.accent}>Financial Independence</span>
              </h2>
              <p className={styles.sectionSub}>
                Real stories prove it: homemakers building ₹20–50 lakh
                portfolios, young professionals buying homes solo, mid-career
                women negotiating better pay after financial upskilling.
              </p>

              <div className={styles.mythCards}>
                {myths.map((m, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className={styles.mythCard}
                  >
                    <div className={styles.mythTop}>
                      <XCircle size={16} className={styles.mythX} />
                      <span className={styles.mythText}>{m.myth}</span>
                    </div>
                    <div className={styles.mythBottom}>
                      <CheckCircle2 size={16} className={styles.mythCheck} />
                      <span className={styles.realityText}>{m.reality}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className={styles.mythsImageWrapper}
            >
              <Image
                src="/images/women-img.png"
                alt="Women taking control of their finances"
                width={500}
                height={520}
                className={styles.mythsImg}
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className={styles.cta}>
        <div className={styles.ctaOrb} />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={styles.ctaInner}
          >
            <div className={styles.ctaIconRow}>
              <ShieldCheck size={36} className={styles.ctaIcon} />
            </div>
            <h2 className={styles.ctaTitle}>
              Take Control –{" "}
              <span className={styles.ctaAccent}>Your Journey Starts Here</span>
            </h2>
            <p className={styles.ctaDesc}>
              Financial independence for women means choices, safety, respect,
              and legacy. It&apos;s not about being rich—it&apos;s about being
              free.
            </p>
            <p className={styles.ctaTagline}>
              Your future is waiting—claim it now.
            </p>
            <div className={styles.ctaActions}>
              <button
                className={styles.ctaBtn}
                onClick={() => openJoinUsModal()}
              >
                Join Mudralaya – Start Free
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default FinancialWomen;
