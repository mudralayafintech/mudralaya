"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  ShieldCheck,
  DollarSign,
  Rocket,
  Laptop,
  Handshake,
} from "lucide-react";
import styles from "./WhyJoin.module.css";

const features = [
  {
    icon: <Rocket size={24} />,
    title: "Trusted earning & business opportunities",

  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Work from home task jobs",

  },
  {
    icon: <DollarSign size={24} />,
    title: "Step-by-step training & guidance",

  },
  {
    icon: <Zap size={24} />,
    title: "Complete onboarding & growth support",

  },
  {
    icon: <Laptop size={24} />,
    title: "Safe, transparent earning system",
  },
  {
    icon: <Handshake size={24} />,
    title: "Step-by-Step Growth",
    description:
      "From Partner → Skilled Partner → Entrepreneur. We grow together.",
  },
];

const WhyJoin = () => {
  return (
    <section className={styles.whyJoin}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>
            What Mudralaya <span className={styles.accent}> Offers</span>
          </h2>
          <p className={styles.subtitle}>Work Smart. Earn Big. Live Free.</p>
        </div>

        <div className={styles.gridWrapper}>
          {features.map((feature, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.iconBox}>{feature.icon}</div>
              <div className={styles.cardContent}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyJoin;
