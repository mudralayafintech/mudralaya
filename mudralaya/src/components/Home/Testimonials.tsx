"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Testimonials.module.css";

const testimonialData = [
    {
        name: "Priya",
        age: 21,
        location: "Jaipur",
        role: "Student",
        quote: "I discovered Mudralaya while looking for a legit online earning platform for students in India. The Mudralaya tasks are simple and flexible, and the training really helped me get started. Within a few weeks, I was earning consistently from home while continuing my studies. The Mudralaya partner program gave me guidance on growing my tasks into a small business. Highly recommend this platform!"
    },
    {
        name: "Sunita",
        age: 35,
        location: "Lucknow",
        role: "Homemaker",
        quote: "Mudralaya work from home opportunities changed the way I contribute to my family income. The tasks are easy to understand, the Mudralaya earning platform is completely safe, and I get paid on time. I love the flexibility—I can choose tasks that fit my schedule. Their Mudralaya earn money guide was very helpful when I first signed up."
    },
    {
        name: "Rohit",
        age: 24,
        location: "Patna",
        role: "Early Career Professional",
        quote: "I was skeptical at first, but after joining Mudralaya, I realized how transparent and reliable this platform is. The Mudralaya task platform benefits go beyond earning money—they provide training, skill-building, and real growth opportunities. The online earning experience is smooth, and signing up was simple with Mudralaya signup tasks. Definitely a legit way to earn online."
    },
    {
        name: "Ananya",
        age: 20,
        location: "Indore",
        role: "College Student",
        quote: "Mudralaya online earning has been a game-changer for me. I can work from home, complete tasks, and earn money daily without any investment. I followed the Mudralaya earn money guide, and it made everything so clear."
    }
];

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonialData.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonialData.length) % testimonialData.length);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className={styles.testimonials}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        What Our <span className={styles.accent}>Partners Say</span>
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
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className={styles.testimonialCard}
                                >
                                    <div className={styles.quoteIcon}>
                                        <Quote size={32} fill="currentColor" />
                                    </div>

                                    <p className={styles.content}>&quot;{testimonialData[currentIndex].quote}&quot;</p>

                                    <div className={styles.authorInfo}>
                                        <span className={styles.name}>
                                            {testimonialData[currentIndex].name}, {testimonialData[currentIndex].age}
                                        </span>
                                        <span className={styles.location}>
                                            {testimonialData[currentIndex].role} — {testimonialData[currentIndex].location}
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
                    {testimonialData.map((_, index) => (
                        <div
                            key={index}
                            className={`${styles.dot} ${currentIndex === index ? styles.activeDot : ""}`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
