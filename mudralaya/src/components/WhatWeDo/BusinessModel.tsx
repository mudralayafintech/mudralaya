"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wallet, CalendarRange, TrendingUp, BadgeCheck, ArrowRight } from "lucide-react";
import styles from "./WhatWeDo.module.css";

const revenuePoints = [
    { icon: <Wallet size={24} />, text: "Commission per task" },
    { icon: <CalendarRange size={24} />, text: "Monthly campaign fees" },
    { icon: <TrendingUp size={24} />, text: "Performance bonuses" },
    { icon: <BadgeCheck size={24} />, text: "Premium brand onboarding" }
];

const BusinessModel = () => {
    return (
        <section className={styles.section} style={{ background: 'white' }}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.problemBadge}>Revenue & Business Model (B2B)</div>
                    <h2 className={styles.title}>Partners Earn, <span className={styles.accent}>Companies Pay</span></h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    marginBottom: '4rem'
                }}>
                    {revenuePoints.map((point, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={styles.card}
                            style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}
                        >
                            <div style={{ color: 'var(--primary)', background: 'rgba(37, 99, 235, 0.05)', padding: '1rem', borderRadius: '12px' }}>
                                {point.icon}
                            </div>
                            <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{point.text}</span>
                        </motion.div>
                    ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className={styles.ctaButton} style={{ background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)', boxShadow: 'none' }}>
                        For Companies: Explore Our Services <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BusinessModel;
