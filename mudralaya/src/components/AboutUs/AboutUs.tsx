"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Target,
  Eye,
  Users,
  HandHelping,
  GraduationCap,
  Store,
  Briefcase,
  Zap,
  Laptop,
  Building2,
  Settings,
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
                About <span className={styles.accent}>Mudralaya</span>
              </h1>
              <h2 className={styles.heroSubtitle}>
                Empowering Financial Simplicity Through AI.
              </h2>
              <p className={styles.heroText}>
                Mudralaya is a partner-based earning ecosystem that bridges the gap between B2B companies and verified local partners (workers).
                Mudralaya Fintech creates safe, transparent, and structured earning opportunities for individuals—especially in Tier 2 & Tier 3 cities—where genuine income options are limited.
                We are not a task app.
                <br />
                We are not cheap labour.
                <br />
                We are a trusted growth platform for earning + skill development + career building.

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
              Mudralaya’s mission is to build India’s most trusted partner ecosystem by creating scam-free, structured earning opportunities that empower women financially, make students industry-ready through real work exposure, generate sustainable employment in Tier 2 and Tier 3 India, and enable scalable, efficient B2B growth across Bharat.
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/what-we-do.png"
                alt="What We Do"
                className={styles.sideImg}
              />
            </div>
            <div className={styles.contentCol}>
              <h2 className={styles.sideTitle}>
                Types of Partners at <span className={styles.accent}>Mudralaya</span>
              </h2>
              <p className={styles.sideDesc}>
                We bridge the gap between financial services and the common man
                by creating a trusted digital ecosystem.
              </p>
              <div className={styles.benefitList}>
                <div className={styles.benefitItem}>
                  <HandHelping className={styles.benefitIcon} />
                  <span>Student & Early-Career Partners</span>
                </div>
                <div className={styles.benefitItem}>
                  <GraduationCap className={styles.benefitIcon} />
                  <span>Women Empowerment (Housewife) Partners</span>
                </div>
                <div className={styles.benefitItem}>
                  <Users className={styles.benefitIcon} />
                  <span>Educated Unemployed Youth</span>
                </div>
                <div className={styles.benefitItem}>
                  <Store className={styles.benefitIcon} />
                  <span>Dedicated Salaried Partners</span>
                </div>
                <div className={styles.benefitItem}>
                  <Building2 className={styles.benefitIcon} />
                  <span>Kiosk / Franchise Business Partners</span>
                </div>
                <div className={styles.benefitItem}>
                  <Settings className={styles.benefitIcon} />
                  <span>Resource & Operational Partners</span>
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
                Mudralaya envisions an India where people can build meaningful careers from their hometowns without forced migration, where local talent drives national business growth, and where trust, transparency, and inclusive opportunity define the future of work.
              </p>
            </div>
            <div className={styles.illustrationCol}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
              Why <span className={styles.accent}>Mudralaya? (USP)</span>
            </h2>
            <p>
              Mudralaya bridges the gap by giving individuals a platform to
              learn, earn, and lead.
            </p>
          </div>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <Users className={styles.featureIcon} size={32} />
              <p>Scam-free, verified partner ecosystem</p>
            </div>
            <div className={styles.featureCard}>
              <Briefcase className={styles.featureIcon} size={32} />
              <p>End-to-end enablement (training, tools, CRM, branding)</p>
            </div>
            <div className={styles.featureCard}>
              <Zap className={styles.featureIcon} size={32} />
              <p>Local execution at scale for B2B companies</p>
            </div>
            <div className={styles.featureCard}>
              <Laptop className={styles.featureIcon} size={32} />
              <p>Career growth + earning from your hometown</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
