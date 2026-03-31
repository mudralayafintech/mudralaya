"use client";

import React from "react";
import { motion, type Variants, type Easing } from "framer-motion";
import {
  ArrowRight,
  Lightbulb,
  Shield,
  TrendingUp,
  DollarSign,
  FileText,
  BarChart2,
  Users,
  Layers,
  GraduationCap,
  Scale,
  Network,
  Rocket,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { useUI } from "@/context/UIContext";
import styles from "./FinancialEntrepreneurship.module.css";

const easeOut: Easing = "easeOut";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: easeOut },
  }),
};

const whyItems = [
  {
    icon: <DollarSign size={20} />,
    text: "Secure funding without losing control",
  },
  {
    icon: <BarChart2 size={20} />,
    text: "Track every rupee with real-time insights",
  },
  {
    icon: <TrendingUp size={20} />,
    text: "Scale smartly while keeping costs low",
  },
  {
    icon: <FileText size={20} />,
    text: "Navigate taxes, compliance, and cash flow like a pro",
  },
  {
    icon: <Rocket size={20} />,
    text: "Build sustainable growth instead of burning out fast",
  },
];

const features = [
  {
    icon: <Layers size={26} />,
    title: "Integrated Financial Tools",
    desc: "Budgeting, forecasting, invoicing, expense tracking all in one dashboard.",
  },
  {
    icon: <DollarSign size={26} />,
    title: "Funding & Investment Guidance",
    desc: "Connect to investors, understand valuation, pitch decks, and bootstrapping strategies.",
  },
  {
    icon: <BarChart2 size={26} />,
    title: "Growth Analytics",
    desc: "Real-time KPIs, profit/loss insights, cash flow projections to make data-driven decisions.",
  },
  {
    icon: <GraduationCap size={26} />,
    title: "Learning & Mentorship",
    desc: "Modules on financial modeling, pricing strategies, scaling finance, plus expert guidance.",
  },
  {
    icon: <Scale size={26} />,
    title: "Compliance & Legal Support",
    desc: "GST, company registration, TDS basics simplified for startups.",
  },
  {
    icon: <Network size={26} />,
    title: "Community & Networking",
    desc: "Join like-minded entrepreneurs, share challenges, find collaborators.",
  },
  {
    icon: <Zap size={26} />,
    title: "Scalable Resources",
    desc: "From solo founder to team expansion – tools grow with you.",
  },
];

const stats = [
  { value: "₹0", label: "No hidden fees to start" },
  { value: "7+", label: "Core platform features" },
  { value: "100%", label: "India-focused tools" },
];

const FinancialEntrepreneurship = () => {
  const { openJoinUsModal } = useUI();

  return (
    <div className={styles.page}>

      {/* ─── Hero ─── */}
      <section className={styles.hero}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={styles.heroContent}
          >
            <div className={styles.badge}>
              <Lightbulb size={14} className={styles.badgeIcon} />
              <span>Financial Entrepreneurship Platform</span>
            </div>

            <h1 className={styles.heroTitle}>
              Financial Entrepreneurship Platform
            </h1>

            <p className={styles.heroDesc}>
              Dreaming of building your own business but worried about cash
              flow, funding, scaling, or just not knowing where to start? A
              dedicated financial entrepreneurship platform changes that – it
              combines entrepreneurial tools with powerful financial
              intelligence to help you{" "}
              <strong>launch, manage, and grow</strong> finance-driven ventures
              confidently.
            </p>

            <p className={styles.heroPill}>
              Whether you&apos;re a first-time founder, side-hustler scaling
              up, or professional pivoting to entrepreneurship, the right
              platform gives you the edge in today&apos;s competitive Indian
              startup scene.
            </p>

            <div className={styles.heroActions}>
              <button
                className={styles.primaryBtn}
                onClick={() => openJoinUsModal()}
              >
                Explore the Platform
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Stats row */}
            <div className={styles.statsRow}>
              {stats.map((s, i) => (
                <div key={i} className={styles.statItem}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Why Essential ─── */}
      <section className={styles.whySection}>
        <div className="container">
          <div className={styles.whyLayout}>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.whyLeft}
            >
              <h2 className={styles.sectionTitle}>
                Financial Entrepreneurship Platform
              </h2>
              <p className={styles.sectionSub}>
                Starting and running a business isn&apos;t just about a great
                idea anymore – it&apos;s about mastering money from day one.
                In India, where access to capital can be tough and regulations
                evolve quickly, a specialized platform bridges the gap –
                offering practical finance tools tailored for entrepreneurs,
                not just corporate giants.
              </p>

              <ul className={styles.whyList}>
                {whyItems.map((item, i) => (
                  <motion.li
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className={styles.whyItem}
                  >
                    <span className={styles.whyIconBox}>{item.icon}</span>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Right – decorative info panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className={styles.whyRight}
            >
              <div className={styles.infoPanel}>
                <div className={styles.infoPanelTop}>
                  <Rocket size={36} className={styles.infoPanelIcon} />
                  <h3 className={styles.infoPanelTitle}>Built for Indian Entrepreneurs</h3>
                  <p className={styles.infoPanelDesc}>
                    From Tier 2 cities to metro startups, Mudralaya&apos;s
                    platform is designed for the realities of the Indian
                    market—not Silicon Valley playbooks.
                  </p>
                </div>
                <div className={styles.infoPanelDivider} />
                <div className={styles.infoPanelChecks}>
                  {[
                    "No finance degree required",
                    "Beginner-to-advanced learning paths",
                    "Real-world Indian case studies",
                    "Vernacular support coming soon",
                    "Community of 1000+ entrepreneurs",
                  ].map((c, i) => (
                    <div key={i} className={styles.infoPanelCheck}>
                      <CheckCircle2 size={16} className={styles.checkIcon} />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── Key Features ─── */}
      <section className={styles.featuresSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Key Features to Expect from a{" "}
              <span className={styles.accent}>Powerful Platform</span>
            </h2>
            <p className={styles.sectionSub}>
              Look for these core elements that accelerate real business
              growth. These features help turn passion projects into
              profitable, sustainable businesses faster.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={styles.featureCard}
              >
                <div className={styles.featureIconBox}>{f.icon}</div>
                <h4 className={styles.featureTitle}>{f.title}</h4>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}

            {/* Highlight card */}
            <motion.div
              custom={features.length}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className={`${styles.featureCard} ${styles.featureHighlight}`}
            >
              <Users size={26} className={styles.featureHighlightIcon} />
              <h4 className={styles.featureTitle}>For Every Stage</h4>
              <p className={styles.featureDesc}>
                From idea to execution to scale – one platform that grows
                alongside your entrepreneurial journey.
              </p>
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
              <Shield size={36} className={styles.ctaIcon} />
            </div>
            <h2 className={styles.ctaTitle}>
              Launch Smarter, Grow Faster –{" "}
              <span className={styles.ctaAccent}>Start Today</span>
            </h2>
            <p className={styles.ctaDesc}>
              Don&apos;t let financial hurdles slow your entrepreneurial
              journey. A trusted financial entrepreneurship platform equips
              you with the knowledge, tools, and support to build confidently
              from the ground up.
            </p>
            <p className={styles.ctaTagline}>
              Ready to launch? Take control of your financial future today.
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

export default FinancialEntrepreneurship;
