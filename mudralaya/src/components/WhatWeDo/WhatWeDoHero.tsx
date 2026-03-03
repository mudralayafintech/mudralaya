"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import styles from "./WhatWeDo.module.css";

const WhatWeDoHero = () => {
    return (
        <section className={`${styles.section} ${styles.hero}`}>
            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className={styles.problemBadge}>
                        The Problem: Fear & Mistrust
                    </div>
                    <h1 className={styles.title}>
                        Earn <span className={styles.accent}>Safely</span>. Avoid Scams. <br />
                        Grow Your <span className={styles.accent}>Skills</span>.
                    </h1>
                    <p className={styles.subtitle} style={{ marginBottom: '2.5rem' }}>
                        Most online earning platforms are fake. Mudralaya provides verified tasks
                        and a trusted ecosystem for Tier 2 & Tier 3 India.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={styles.ctaButton}
                    >
                        Start Earning Safely <ArrowRight size={20} />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};

export default WhatWeDoHero;
