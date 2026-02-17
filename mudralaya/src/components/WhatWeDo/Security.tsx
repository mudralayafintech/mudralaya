"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, FileCheck, Landmark, Search, MessageSquare, ArrowRight } from "lucide-react";
import styles from "./WhatWeDo.module.css";

const securityFeatures = [
    { icon: <UserCheck size={20} />, text: "KYC verification" },
    { icon: <ShieldCheck size={20} />, text: "Verified companies" },
    { icon: <FileCheck size={20} />, text: "Task approval" },
    { icon: <Landmark size={20} />, text: "Transparent payouts" },
    { icon: <Search size={20} />, text: "Fraud detection" },
    { icon: <MessageSquare size={20} />, text: "Dispute resolution" }
];

const Security = () => {
    return (
        <section className={styles.section} style={{ background: 'var(--gradient-surface)' }}>
            <div className={styles.container}>
                <div style={{
                    background: 'white',
                    padding: '4rem',
                    borderRadius: 'var(--radius-3xl)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-xl)',
                    borderTop: '5px solid var(--primary)'
                }}>
                    <h2 className={styles.title}>The <span className={styles.accent}>Safest</span> Earning Platform in India</h2>

                    <div className={styles.securityList}>
                        {securityFeatures.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={styles.securityItem}
                            >
                                <span className={styles.securityIcon}>{feature.icon}</span>
                                {feature.text}
                            </motion.div>
                        ))}
                    </div>

                    <button className={styles.ctaButton}>
                        Sign Up Securely <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Security;
