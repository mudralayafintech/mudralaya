"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants, type Easing } from "framer-motion";
import {
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  PiggyBank,
  Briefcase,
  Star,
  Wifi,
  Clock,
  PlayCircle,
  Smartphone,
  Award,
  Wallet,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useUI } from "@/context/UIContext";
import styles from "./FinancialCourses.module.css";

const benefits = [
  {
    icon: <TrendingUp size={22} />,
    text: "Build smart habits while expenses are still low",
  },
  {
    icon: <ShieldAlert size={22} />,
    text: "Avoid common traps like impulse buying or high-interest debt",
  },
  {
    icon: <PiggyBank size={22} />,
    text: "Learn to grow small savings through simple investments",
  },
  {
    icon: <Briefcase size={22} />,
    text: "Gain confidence for salary talks, EMIs, and future planning",
  },
  {
    icon: <Star size={22} />,
    text: "Stand out in job interviews with real-world money knowledge",
  },
];

const features = [
  {
    icon: <Wifi size={22} />,
    title: "100% Online",
    desc: "Learn from hostel, café, or home – anytime, anywhere.",
  },
  {
    icon: <Clock size={22} />,
    title: "Self-Paced",
    desc: "Fit learning around classes, exams, and hangouts.",
  },
  {
    icon: <PlayCircle size={22} />,
    title: "Short Modules",
    desc: "15–40 min videos, quizzes, and real-life examples.",
  },
  {
    icon: <Smartphone size={22} />,
    title: "Mobile-Friendly",
    desc: "Study on your phone during commutes or breaks.",
  },
  {
    icon: <Award size={22} />,
    title: "Certificates Included",
    desc: "Add to LinkedIn or resume and boost your profile.",
  },
  {
    icon: <Wallet size={22} />,
    title: "Affordable Pricing",
    desc: "Designed specifically for student budgets in India.",
  },
];

const easeOut: Easing = "easeOut";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: easeOut },
  }),
};

const FinancialCourses = () => {
  const { openJoinUsModal } = useUI();

  return (
    <div className={styles.page}>
      {/* ─── Hero ─── */}
      <section className={styles.hero}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />

        <div className="container">
          <div className={styles.heroGrid}>
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={styles.heroContent}
            >
              <div className={styles.badge}>
                <BookOpen size={15} className={styles.badgeIcon} />
                <span>Financial Courses for Students</span>
              </div>

              <h1 className={styles.heroTitle}>
                Master Money Skills Before{" "}
                <span className={styles.gradientText}>Life Throws</span> Real
                Bills at You
              </h1>

              <p className={styles.heroSub}>
                Financial Courses for Students – because knowing how to manage
                ₹500 pocket money today can save you from ₹50,000 debt
                tomorrow.
              </p>

              <p className={styles.heroDesc}>
                In today&apos;s fast world, students face money decisions early:
                UPI splurges, education loans, first internships, side gigs, and
                that tempting credit card offer. Without solid basics, it&apos;s
                easy to slip into stress. That&apos;s where financial courses
                for students step in – practical, beginner-friendly online
                programs built specifically for young learners in India.
              </p>

              <div className={styles.heroActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => openJoinUsModal()}
                >
                  Start Learning Today
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className={styles.heroImageWrapper}
            >
              <Image
                src="/images/student/80d5cfe2-3467-4482-9301-2499287e5f38.jpg"
                alt="Student learning financial courses online"
                width={600}
                height={420}
                priority
                className={styles.heroImg}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Why Every Student Needs Financial Education ─── */}
      <section className={styles.benefits}>
        <div className="container">
          <div className={styles.twoCol}>
            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className={styles.benefitsContent}
            >
              <h2 className={styles.sectionTitle}>
                Why Every Student Needs{" "}
                <span className={styles.accent}>Financial Education</span> Now
              </h2>
              <p className={styles.sectionSub}>
                Starting early gives massive advantages. Whether you&apos;re in
                college, preparing for placements, or juggling part-time work,
                these skills turn financial anxiety into control.
              </p>

              <ul className={styles.benefitList}>
                {benefits.map((item, i) => (
                  <motion.li
                    key={i}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className={styles.benefitItem}
                  >
                    <span className={styles.benefitIcon}>{item.icon}</span>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Icons illustration side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className={styles.benefitsImageWrapper}
            >
              <Image
                src="/images/student/a2b204d8-9029-4455-a3ff-fe1c410b9045.jpg"
                alt="Financial literacy icons"
                width={540}
                height={380}
                className={styles.benefitsImg}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Flexible, Student-Friendly Learning ─── */}
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresHeader}>
        <h2 className={styles.sectionTitle}>
          Flexible, <span className={styles.accent}>Student-Friendly</span>{" "}
          Learning
        </h2>
        <p className={styles.sectionSub}>
          No prior knowledge needed. Start from basics and progress at your
          own speed.
        </p>
        </div>

        <div className={styles.featuresLayout}>
        {/* Feature cards grid */}
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
            <div>
              <h4 className={styles.featureTitle}>{f.title}</h4>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
            </motion.div>
          ))}
        </div>

        {/* Team image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className={styles.featuresImageWrapper}
          style={{ alignSelf: "center" }}
        >
          <Image
            src="/images/student/c2cbeb39-2db8-481d-bfac-10d1536ffe12.jpg"
            alt="Students collaborating on financial learning"
            width={540}
            height={420}
            className={styles.featuresImg}
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
            <h2 className={styles.ctaTitle}>
              Take the First Step Toward{" "}
              <span className={styles.ctaAccent}>Financial Freedom</span>
            </h2>
            <p className={styles.ctaDesc}>
              Don&apos;t wait for your first job to learn money management.
              Equip yourself now with the best financial courses for students
              online – practical knowledge that pays off for decades.
            </p>
            <div className={styles.ctaActions}>
              <button
                className={styles.ctaBtn}
                onClick={() => openJoinUsModal()}
              >
                Enroll Now – It&apos;s Free to Start
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FinancialCourses;
