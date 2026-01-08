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
    title: "Entrepreneurship for All",
    description:
      "Start earning from home and grow at your pace with our guided roadmap.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Women-Focused",
    description:
      "Supporting women in restarting careers or seeking financial independence.",
  },
  {
    icon: <DollarSign size={24} />,
    title: "Zero-Investment Options",
    description: "Begin your journey without any upfront costs or hidden fees.",
  },
  {
    icon: <Zap size={24} />,
    title: "Multi-Task Earnings",
    description: "Complete tasks from multiple top companies & earn instantly.",
  },
  {
    icon: <Laptop size={24} />,
    title: "Training and Skill Growth",
    description: "Weekly sessions with daily guidance from industry experts.",
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
            Why Join <span className={styles.accent}>Mudralaya?</span>
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
