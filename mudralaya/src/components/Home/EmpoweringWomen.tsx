"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Globe, Heart } from "lucide-react";
import styles from "./EmpoweringWomen.module.css";

const EmpoweringWomen = () => {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {/* Left: Text Content */}
          <div className={styles.content}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className={styles.textContent}
            >
              <div className={styles.badge}>
                <Heart size={14} fill="currentColor" />
                <span>GROWTH & EMPOWERMENT</span>
              </div>
              <h2 className={styles.title}>
                Women <br />
                Empowerment <br />
                and <span className={styles.highlight}>Financial Growth</span>
              </h2>
              <div className={styles.points}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={styles.pointItem}
                >
                  <Sparkles size={20} className={styles.iconPink} />
                  <p>Your financial independence starts here.</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={styles.pointItem}
                >
                  <Globe size={20} className={styles.iconPink} />
                  <p>Women leading India&apos;s financial future.</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className={styles.pointItem}
                >
                  <div className={styles.dot} />
                  <p>
                    Start small,{" "}
                    <span className={styles.bold}>
                      grow big with Mudralaya.
                    </span>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right: Dual Image Composition */}
          <div className={styles.images}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className={styles.mainImageWrapper}
            >
              <img
                src="/images/women.png"
                alt="Women Power"
                className={styles.mainImg}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20, x: 20 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className={styles.floatingCard}
            >
              <img
                src="/images/women-img.png"
                alt="Community"
                className={styles.floatingImg}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmpoweringWomen;
