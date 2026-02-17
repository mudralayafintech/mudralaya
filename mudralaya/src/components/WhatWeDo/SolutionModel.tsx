"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Link as LinkIcon } from "lucide-react";
import styles from "./WhatWeDo.module.css";

const SolutionModel = () => {
    return (
        <section className={styles.section} style={{ background: 'var(--gradient-surface)' }}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.problemBadge}>Core Solution</div>
                    <h2 className={styles.title}>The Bridge Model</h2>
                    <p className={styles.subtitle}>
                        Mudralaya = Trust + Work + Earnings + Learning
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '4rem',
                    borderRadius: 'var(--radius-3xl)',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-xl)',
                    position: 'relative'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap',
                        marginBottom: '3rem'
                    }}>
                        <div className={styles.card} style={{ minWidth: '200px' }}>Real Company Tasks</div>
                        <LinkIcon size={32} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                        <div className={styles.card} style={{ minWidth: '200px', background: 'var(--primary)', color: 'white' }}>Mudralaya</div>
                        <LinkIcon size={32} style={{ color: 'var(--primary)', opacity: 0.5 }} />
                        <div className={styles.card} style={{ minWidth: '200px' }}>Verified Partners</div>
                    </div>

                    <p style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '2.5rem', fontWeight: 500 }}>
                        Real company tasks. Verified partners. Safe payouts. Training included.
                    </p>

                    <button className={styles.ctaButton}>
                        Explore Tasks <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default SolutionModel;
