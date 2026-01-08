"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Target,
  Eye,
  Rocket,
  Users,
  HandHelping,
  GraduationCap,
  Store,
  Briefcase,
  Zap,
  Laptop,
} from "lucide-react";
import { useUI } from "@/context/UIContext";
import styles from "./AboutUs.module.css";

const AboutUs = () => {
  const { openJoinUsModal } = useUI();

  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className={styles.heroContent}
            >
              <h1 className={styles.heroTitle}>
                About <span className={styles.accent}>Us</span>
              </h1>
              <h2 className={styles.heroSubtitle}>
                Empowering Financial Simplicity Through AI.
              </h2>
              <p className={styles.heroText}>
                Mudralaya is India&apos;s emerging financial entrepreneurship
                platform, built to empower individuals — especially women — to
                earn, grow, and build their own financial careers or franchises.
              </p>
              <div className={styles.heroActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => openJoinUsModal()}
                >
                  Become Our Partner
                </button>
                <Link href="/#plans">
                  <button className={styles.secondaryBtn}>Explore Plans</button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.heroImageWrapper}
            >
              <img
                src="/images/about-us.png"
                alt="About Mudralaya"
                className={styles.heroImg}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.mission}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div className={styles.iconBox}>
              <Target size={32} />
            </div>
            <h2>
              Our <span className={styles.accent}>Mission</span>
            </h2>
            <p>
              To create 1 lakh financial entrepreneurs across India through
              simple earning models and structured training.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={styles.videoWrapper}
          >
            <video
              className={styles.video}
              controls
              playsInline
              preload="metadata"
            >
              <source
                src="https://mhsizqmhqngcaztresmh.supabase.co/storage/v1/object/public/videos/WhatsApp%20Video%202026-01-09%20at%2012.42.41%20AM.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className={styles.whatWeDo}>
        <div className="container">
          <div className={styles.grid2}>
            <div className={styles.illustrationCol}>
              <img
                src="/images/what-we-do.png"
                alt="What We Do"
                className={styles.sideImg}
              />
            </div>
            <div className={styles.contentCol}>
              <h2 className={styles.sideTitle}>
                What We <span className={styles.accent}>Do</span>
              </h2>
              <p className={styles.sideDesc}>
                We bridge the gap between financial services and the common man
                by creating a trusted digital ecosystem.
              </p>
              <div className={styles.benefitList}>
                <div className={styles.benefitItem}>
                  <HandHelping className={styles.benefitIcon} />
                  <span>Start earning with zero investment</span>
                </div>
                <div className={styles.benefitItem}>
                  <GraduationCap className={styles.benefitIcon} />
                  <span>Become a trained professional</span>
                </div>
                <div className={styles.benefitItem}>
                  <Users className={styles.benefitIcon} />
                  <span>Build leadership skills</span>
                </div>
                <div className={styles.benefitItem}>
                  <Store className={styles.benefitIcon} />
                  <span>Grow into a franchise owner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className={styles.vision}>
        <div className="container">
          <div className={styles.grid2}>
            <div className={styles.contentCol}>
              <div className={styles.iconBox}>
                <Eye size={32} />
              </div>
              <h2 className={styles.sideTitle}>
                Our <span className={styles.accent}>Vision</span>
              </h2>
              <p className={styles.sideDesc}>
                To build a nationwide network of entrepreneurs and financial
                leaders who uplift communities and shape the future of
                India&apos;s financial ecosystem.
              </p>
            </div>
            <div className={styles.illustrationCol}>
              <img
                src="/images/vision.png"
                alt="Our Vision"
                className={styles.sideImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className={styles.whyExist}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>
              Why We <span className={styles.accent}>Exist</span>
            </h2>
            <p>
              Mudralaya bridges the gap by giving individuals a platform to
              learn, earn, and lead.
            </p>
          </div>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <Users className={styles.featureIcon} size={32} />
              <p>More women in entrepreneurship</p>
            </div>
            <div className={styles.featureCard}>
              <Briefcase className={styles.featureIcon} size={32} />
              <p>Job alternatives beyond tradition</p>
            </div>
            <div className={styles.featureCard}>
              <Zap className={styles.featureIcon} size={32} />
              <p>Multi-Product Earnings</p>
            </div>
            <div className={styles.featureCard}>
              <Laptop className={styles.featureIcon} size={32} />
              <p>Training & Skill Growth</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
