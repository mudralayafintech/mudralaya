"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPinOff, TrendingDown, Lock, ArrowRight } from "lucide-react";
import styles from "./WhatWeDo.module.css";

const challenges = [
    {
        icon: <MapPinOff size={28} />,
        title: "Lack of local access",
        text: "Big companies struggle to reach talented individuals in smaller cities."
    },
    {
        icon: <TrendingDown size={28} />,
        title: "High cost of expansion",
        text: "Traditional models are too expensive for widespread rural growth."
    },
    {
        icon: <Lock size={28} />,
        title: "Skills and trust gap",
        text: "A massive gap exists between available work and verified earning opportunities."
    }
];

const Challenges = () => {
    return (
        <section className={styles.section} style={{ background: 'white' }}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        Why Tier 2 & 3 India Struggles <br />
                        <span className={styles.accent}>to Find Opportunities</span>
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    {challenges.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={styles.card}
                        >
                            <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{item.icon}</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{item.title}</h3>
                            <p style={{ color: 'var(--secondary)', lineHeight: 1.6 }}>{item.text}</p>
                        </motion.div>
                    ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className={styles.ctaButton} style={{ background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)', boxShadow: 'none' }}>
                        Learn How We Bridge the Gap <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Challenges;
