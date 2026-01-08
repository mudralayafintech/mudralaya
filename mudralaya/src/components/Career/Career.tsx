"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users,
  Lightbulb,
  Handshake,
  GraduationCap,
  Code,
  Palette,
  BarChart,
  Video,
  Smartphone,
  Box,
  Settings,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useUI } from "@/context/UIContext";
import styles from "./Career.module.css";

const Career = () => {
  const router = useRouter();
  const { openJoinUsModal } = useUI();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className={styles.careerPage}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className={styles.heroContent}
            >
              <h1 className={styles.heroTitle}>
                Start Your Career <br />
                in <span className={styles.accent}>Mudralaya</span>
              </h1>
              <p className={styles.heroDesc}>
                We are the people who dream & do. Join a community where your
                skills meet real opportunity.
              </p>
              <div className={styles.heroActions}>
                <button
                  onClick={() => router.push("/about")}
                  className={styles.secondaryBtn}
                >
                  About Us
                </button>
                <button
                  onClick={() => openJoinUsModal()}
                  className={styles.primaryBtn}
                >
                  Become Our Partner
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.heroImages}
            >
              <div className={styles.imageBox}>
                <img
                  src="/images/carrier.jpg"
                  alt="Team"
                  className={styles.mainImg}
                />
                <div className={styles.glow} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className={styles.reasons}>
        <div className="container">
          <motion.div {...fadeInUp} className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Why You Should <span className={styles.accent}>Join Us</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Join a mission-driven team where impact is the priority.
            </p>
          </motion.div>

          <div className={styles.grid4}>
            {[
              {
                icon: <Users />,
                title: "Real Tasks, Real Earnings",
                desc: "Complete verified tasks. Earn money after approval—no fake promises.",
              },
              {
                icon: <Lightbulb />,
                title: "Freedom & Flexibility",
                desc: "Choose tasks based on your time and skill. Work whenever you want.",
              },
              {
                icon: <Handshake />,
                title: "Transparent Payments",
                desc: "Earnings go to your Wallet. Minimum withdrawal: ₹500. No fees.",
              },
              {
                icon: <GraduationCap />,
                title: "Learn & Grow",
                desc: "Improve your skills while earning. Explore tasks from basic to pro.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className={styles.reasonCard}
              >
                <div className={styles.iconBox}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categories}>
        <div className="container">
          <div className={styles.grid3}>
            {[
              {
                icon: <Code />,
                title: "Development",
                desc: "Full-Stack, Front-End, & Back-End roles.",
              },
              {
                icon: <Palette />,
                title: "Design",
                desc: "UI/UX, Visual, & Creative Direction.",
              },
              {
                icon: <BarChart />,
                title: "Marketing",
                desc: "SEO, Content, & Performance Marketing.",
              },
              {
                icon: <Video />,
                title: "Multimedia",
                desc: "Animation, Video Editing, & Production.",
              },
              {
                icon: <Smartphone />,
                title: "Mobile",
                desc: "iOS, Android, & Cross-Platform Dev.",
              },
              {
                icon: <Box />,
                title: "3D & VR",
                desc: "3D Modeling, Animation, & Visual Effects.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className={styles.categoryCard}
              >
                <div className={styles.catIcon}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className={styles.cta}>
            <p>Interested in working with us?</p>
            <a href="mailto:contact@mudralaya.com" className={styles.emailCta}>
              contact@mudralaya.com <ArrowRight size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.values}>
        <div className="container">
          <div className={styles.valuesGrid}>
            <div className={styles.valuesImgCol}>
              <img
                src="/images/about-us.png"
                alt="Working"
                className={styles.valuesImg}
              />
            </div>
            <div className={styles.valuesContent}>
              <h2 className={styles.sideTitle}>
                Working at <span className={styles.accent}>Mudralaya</span>
              </h2>
              <p className={styles.sideDesc}>
                We foster a culture of trust, innovation, and direct impact.
              </p>

              <div className={styles.valueList}>
                {[
                  {
                    icon: <Lightbulb />,
                    title: "Impact Driven",
                    desc: "We connect communities with real earning opportunities.",
                  },
                  {
                    icon: <Settings />,
                    title: "Flexible Future",
                    desc: "Work online or offline—on your own terms.",
                  },
                  {
                    icon: <Box />,
                    title: "Transparency",
                    desc: "Trust is our foundation. Every step is clear.",
                  },
                ].map((item, i) => (
                  <div key={i} className={styles.valueItem}>
                    <div className={styles.smallIcon}>{item.icon}</div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Career;
