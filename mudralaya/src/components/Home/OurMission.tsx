"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRightLeft,
    MapPin,
    ShieldAlert,
    TrendingUp,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Home,
    Briefcase
} from "lucide-react";
import styles from "./OurMission.module.css";

const focusItems = [
    {
        icon: <MapPin size={24} />,
        title: "Primary Focus on Tier 2 & Tier 3 Cities",
        description: "Bringing modern earning opportunities to every corner of India."
    },
    {
        icon: <ShieldAlert size={24} />,
        title: "Strong Anti-Scam Trust System",
        description: "Multi-layer verification to protect you from fraudulent platforms."
    },
    {
        icon: <TrendingUp size={24} />,
        title: "Real Earning + Skill Development",
        description: "Not just tasks, but a pathway to high-value digital skills."
    },
    {
        icon: <CheckCircle2 size={24} />,
        title: "Long-term Income",
        description: "Sustainable growth instead of short-term exploitation."
    }
];

const partners = [
    {
        icon: <GraduationCap size={40} />,
        title: "Students",
        text: "We train students based on their skills and real company requirements, giving them practical work exposure from early college life. Graduate with experience, skills, and a strong resume — not just a degree.",
        highlight: "Practical Work Exposure"
    },
    {
        icon: <Home size={40} />,
        title: "Educated Housewives",
        text: "Flexible work-from-home or location-based opportunities that enable financial independence while managing personal responsibilities.",
        highlight: "Financial Independence"
    },
    {
        icon: <Briefcase size={40} />,
        title: "Educated Unemployed Youth",
        text: "Structured earning and career growth without the need to migrate to metro cities. Build a career from your hometown, with flexible work earning platform India.",
        highlight: "Career From Hometown"
    }
];

const OurMission = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % partners.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + partners.length) % partners.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className={styles.ourMission}>
            <div className="container">

                {/* How It Works Section */}
                <div className={styles.section}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>
                            How it <span className={styles.accent}>works</span>
                        </h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className={styles.flowContainer}
                    >
                        <div className={styles.flowNode}>Companies</div>
                        <ArrowRightLeft className={styles.arrow} size={24} />
                        <div className={`${styles.flowNode} ${styles.activeNode}`}>Mudralaya</div>
                        <ArrowRightLeft className={styles.arrow} size={24} />
                        <div className={styles.flowNode}>Verified Partners</div>
                    </motion.div>
                </div>

                {/* Our Focus Section */}
                <div className={styles.section}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Our <span className={styles.accent}>Focus</span></h2>
                    </div>

                    <div className={styles.focusGrid}>
                        {focusItems.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={styles.focusCard}
                            >
                                <div className={styles.iconBox}>{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className={styles.footerNote}
                    >
                        Mudralaya = <span className={styles.footerAccent}>Flexible work</span> + Structured earning + Skill building
                    </motion.div>
                </div>

                {/* Problem & Solution Section */}
                <div className={styles.section}>
                    <div className={styles.problemSection}>
                        <div className={styles.problemGrid}>
                            <div>
                                <div className={styles.header} style={{ textAlign: 'left', marginBottom: '2rem' }}>
                                    <h2 className={styles.title}>The Problem We Solve</h2>
                                    <p className={styles.subtitle} style={{ margin: '0' }}>The Reality of Today’s Task Market</p>
                                </div>

                                <p style={{ marginBottom: '1.5rem', fontWeight: 600, color: 'var(--foreground)' }}>Many fake task platforms:</p>
                                <ul className={styles.problemList}>
                                    <li className={styles.problemItem}>
                                        <XCircle className={styles.problemIcon} size={20} />
                                        Show fake or misleading tasks
                                    </li>
                                    <li className={styles.problemItem}>
                                        <XCircle className={styles.problemIcon} size={20} />
                                        Take money or block payouts
                                    </li>
                                    <li className={styles.problemItem}>
                                        <XCircle className={styles.problemIcon} size={20} />
                                        Don’t allow withdrawals
                                    </li>
                                    <li className={styles.problemItem}>
                                        <XCircle className={styles.problemIcon} size={20} />
                                        Trap users with false promises
                                    </li>
                                </ul>
                            </div>

                            <div className={styles.solutionBox}>
                                <h3>The Mudralaya Solution</h3>
                                <p>
                                    Mudralaya exists to eliminate these scams and replace them with trust, transparency, and verified work.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Partner Carousel Section */}
                <div className={styles.carouselSection}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>
                            Who Can Become a <span className={styles.accent}>Mudralaya Partner</span>
                        </h2>
                    </div>

                    <div className={styles.carouselContainer}>
                        <button className={`${styles.navButton} ${styles.prev}`} onClick={prevSlide}>
                            <ChevronLeft size={24} />
                        </button>

                        <div className={styles.overflowWrapper}>
                            <div className={styles.slideWrapper}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className={styles.partnerSlide}
                                    >
                                        <div className={styles.partnerIcon}>
                                            {partners[currentIndex].icon}
                                        </div>
                                        <div className={styles.partnerContent}>
                                            <h3>{partners[currentIndex].title}</h3>
                                            <p className={styles.partnerText}>{partners[currentIndex].text}</p>
                                            <span className={styles.partnerHighlight}>
                                                {partners[currentIndex].highlight}
                                            </span>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        <button className={`${styles.navButton} ${styles.next}`} onClick={nextSlide}>
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className={styles.controls}>
                        {partners.map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.dot} ${currentIndex === index ? styles.activeDot : ""}`}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default OurMission;
