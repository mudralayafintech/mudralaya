"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Trophy, Briefcase, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import styles from "./WhatWeDo.module.css";

const tasks = [
    {
        icon: <Calendar size={40} />,
        title: "Daily Tasks",
        desc: "App installs, surveys, store verification, lead generation",
        purpose: "Daily engagement + consistent earnings"
    },
    {
        icon: <Trophy size={40} />,
        title: "Weekly Contests",
        desc: "Leaderboards, rewards, team challenges",
        purpose: "Motivation + gamified participation"
    },
    {
        icon: <Briefcase size={40} />,
        title: "Dedicated Monthly B2B Tasks",
        desc: "Brand awareness, product adoption, merchant onboarding, offline-to-online campaigns",
        purpose: "Long-term stable income"
    }
];

const TaskTypes = () => {
    const [index, setIndex] = useState(0);

    const next = () => setIndex((index + 1) % tasks.length);
    const prev = () => setIndex((index - 1 + tasks.length) % tasks.length);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [index]);

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Platform Structure: <span className={styles.accent}>3 Task Types</span></h2>
                </div>

                <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={styles.card}
                            style={{ textAlign: 'center', padding: '4rem' }}
                        >
                            <div style={{ color: 'var(--primary)', marginBottom: '2rem' }}>{tasks[index].icon}</div>
                            <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>{tasks[index].title}</h3>
                            <p style={{ fontSize: '1.125rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>{tasks[index].desc}</p>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(37, 99, 235, 0.05)',
                                color: 'var(--primary)',
                                borderRadius: 'var(--radius-lg)',
                                fontWeight: 600
                            }}>
                                Purpose: {tasks[index].purpose}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Nav Buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginTop: '2rem'
                    }}>
                        <button onClick={prev} style={{ padding: '0.5rem', borderRadius: '50%', background: 'white', border: '1px solid #eee' }}><ChevronLeft /></button>
                        <button onClick={next} style={{ padding: '0.5rem', borderRadius: '50%', background: 'white', border: '1px solid #eee' }}><ChevronRight /></button>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button className={styles.ctaButton}>
                        Start Your First Task <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TaskTypes;
