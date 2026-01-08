"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  User,
  ShieldCheck,
  LayoutGrid,
  CreditCard,
  Rocket,
  CircleDollarSign,
} from "lucide-react";
import styles from "./Timeline.module.css";

const timelineItems = [
  {
    step: "1",
    title: "Fill details",
    description: "Fill basic details",
    icon: <User size={20} />,
    position: "top",
    align: "0%",
  },
  {
    step: "2",
    title: "Eligibility",
    description: "Complete eligibility check",
    icon: <ShieldCheck size={20} />,
    position: "bottom",
    align: "25%",
  },
  {
    step: "3",
    title: "Review Plan",
    description: "Review plan & add-ons",
    icon: <LayoutGrid size={20} />,
    position: "top",
    align: "50%",
  },
  {
    step: "4",
    title: "Payment",
    description: "Pay (if required) / Submit",
    icon: <CreditCard size={20} />,
    position: "bottom",
    align: "75%",
  },
  {
    step: "5",
    title: "Training",
    description: "Start training",
    icon: <Rocket size={20} />,
    position: "top",
    align: "100%",
  },
];

const pathD =
  "M 0,100 C 125,100 125,180 250,180 S 375,20 500,20 S 625,180 750,180 S 875,20 1000,20";

const Timeline = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const pathLength = useTransform(smoothProgress, [0, 1], [0, 1]);

  return (
    <section className={styles.timelineWrapper} ref={containerRef}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>
            How to <span className={styles.accent}>Join</span>
          </h2>
          <p className={styles.subtitle}>
            Easy 5-Step Process to Financial Freedom
          </p>
        </div>

        <div className={styles.interactiveArea}>
          {/* SVG Path Desktop */}
          <div className={styles.svgWrapper}>
            <svg
              viewBox="0 0 1000 200"
              preserveAspectRatio="none"
              className={styles.svg}
            >
              <path
                d={pathD}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <motion.path
                d={pathD}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeLinecap="round"
                style={{ pathLength }}
              />
            </svg>
          </div>

          {/* Timeline Cards */}
          <div className={styles.cardsLayout}>
            {timelineItems.map((item, index) => {
              const start = index * 0.25;
              const activationRange = [start - 0.1, start, start + 0.1];
              const opacity = useTransform(
                smoothProgress,
                activationRange,
                [0.3, 1, 0.3]
              );
              const scale = useTransform(
                smoothProgress,
                activationRange,
                [0.9, 1.05, 0.9]
              );

              return (
                <motion.div
                  key={index}
                  className={`${styles.cardNode} ${styles[item.position]}`}
                  style={{
                    opacity,
                    scale,
                    left: item.align,
                  }}
                >
                  <div className={styles.cardIcon}>{item.icon}</div>
                  <div className={styles.cardContent}>
                    <span className={styles.step}>Step {item.step}</span>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
