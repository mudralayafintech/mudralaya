"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, Heart, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import styles from "./WhatWeDo.module.css";

const benefitItems = [
    {
        title: "Partners (Earners)",
        desc: "Verified tasks, learning, flexible earnings, fair payouts",
        detail: "Enabling individuals to build digital careers from their hometowns.",
        icon: <Users size={40} />,
        image: "/images/worker-home.webp"
    },
    {
        title: "B2B Companies",
        desc: "Tier 2/3 expansion, measurable execution, verified outcomes",
        detail: "Bridging the gap between corporate requirements and rural talent.",
        icon: <Building2 size={40} />,
        image: "/images/b2b-team.webp"
    },
    {
        title: "Society / Communities",
        desc: "Local employment, skill-building, reduced migration",
        detail: "Strengthening local economies and empowering the next generation.",
        icon: <Heart size={40} />,
        image: "/images/community.webp"
    }
];

const Ecosystem = () => {
    const [index, setIndex] = useState(0);

    const next = () => setIndex((index + 1) % benefitItems.length);
    const prev = () => setIndex((index - 1 + benefitItems.length) % benefitItems.length);

    useEffect(() => {
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

    return (
        <section className={styles.section} style={{ background: 'white' }}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Who Benefits from <span className={styles.accent}>Mudralaya</span></h2>
                </div>

                <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className={styles.card}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', padding: '3rem' }}
                        >
                            <div className={styles.visualWrapper} style={{ height: '300px', margin: 0 }}>
                                {/* Fallback to themed background if image missing */}
                                <div style={{ width: '100%', height: '100%', background: 'var(--gradient-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    {benefitItems[index].icon}
                                </div>
                            </div>

                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--primary)' }}>{benefitItems[index].title}</h3>
                                <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>{benefitItems[index].desc}</p>
                                <p style={{ color: 'var(--secondary)', lineHeight: 1.6 }}>{benefitItems[index].detail}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <button onClick={prev} style={{ position: 'absolute', left: '-25px', top: '50%', transform: 'translateY(-50%)', padding: '0.75rem', borderRadius: '50%', background: 'white', border: '1px solid #eee', boxShadow: 'var(--shadow-md)' }}><ChevronLeft /></button>
                    <button onClick={next} style={{ position: 'absolute', right: '-25px', top: '50%', transform: 'translateY(-50%)', padding: '0.75rem', borderRadius: '50%', background: 'white', border: '1px solid #eee', boxShadow: 'var(--shadow-md)' }}><ChevronRight /></button>
                </div>

                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                    <button className={styles.ctaButton}>
                        Join Our Ecosystem <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            <style jsx>{`
        @media (max-width: 768px) {
          :global(.${styles.card}) {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            padding: 2rem !important;
          }
        }
      `}</style>
        </section>
    );
};

export default Ecosystem;
