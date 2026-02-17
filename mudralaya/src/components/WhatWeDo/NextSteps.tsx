"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, BookOpen, Rocket, CreditCard, MoveUp, ArrowRight } from "lucide-react";
import styles from "./WhatWeDo.module.css";

const steps = [
    {
        icon: <UserPlus />,
        title: "1. Join Mudralaya",
        text: "Signup + KYC"
    },
    {
        icon: <BookOpen />,
        title: "2. Learn + Get Ready",
        text: "Training modules + guides"
    },
    {
        icon: <Rocket />,
        title: "3. Start Earning",
        text: "Pick tasks → Submit proof → Verified"
    },
    {
        icon: <CreditCard />,
        title: "4. Get Paid",
        text: "Wallet, bank/UPI transfer"
    },
    {
        icon: <MoveUp />,
        title: "5. Grow",
        text: "Levels, leadership, franchise opportunities"
    }
];

const NextSteps = () => {
    return (
        <>
            <section className={styles.section} style={{ background: 'var(--primary)', color: 'white' }}>
                <div className={styles.container}>
                    <div className={styles.header} style={{ marginBottom: '3rem' }}>
                        <h2 className={styles.title} style={{ color: 'white' }}>Start Earning Today with Mudralaya</h2>
                        <p className={styles.subtitle} style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Real tasks. Verified companies. Transparent payouts. Flexible growth.
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <button className={styles.ctaButton} style={{ background: 'white', color: 'var(--primary)' }}>
                            Sign Up as a Partner
                        </button>
                        <button className={styles.ctaButton} style={{ background: 'transparent', border: '2px solid white', boxShadow: 'none' }}>
                            Learn About B2B Programs
                        </button>
                    </div>
                </div>
            </section>

            <section className={styles.section} style={{ background: 'white' }}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Join <span className={styles.accent}>Us</span></h2>
                        <p className={styles.subtitle}>Begin your journey in 5 simple steps</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={styles.card}
                                style={{ flex: '1', minWidth: '200px', padding: '2rem', textAlign: 'center' }}
                            >
                                <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', width: 'max-content', margin: '0 auto 1.5rem' }}>
                                    {step.icon}
                                </div>
                                <h4 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>{step.title}</h4>
                                <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>{step.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                        <button className={styles.ctaButton}>
                            Begin Your Journey <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default NextSteps;
