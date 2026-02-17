"use client";
import React, { useState } from "react";
import styles from "./Faq.module.css";

const faqData = [
  {
    question: "What is Mudralaya?",
    answer:
      "Mudralaya is a trusted task-based earning platform in India that bridges the gap between verified B2B companies and local partners. It provides a smart earning platform for students, homemakers, and professionals to complete real tasks, earn safely, and build skills.",
  },
  {
    question: "Who can join Mudralaya?",
    answer:
      "Anyone can join—students, educated housewives, unemployed youth, and salaried professionals. Mudralaya is ideal for anyone looking for flexible work earning opportunities in India or part-time online earning platforms.",
  },
  {
    question: "Is there any investment required to start?",
    answer:
      "No. Mudralaya is a zero-investment earning site, allowing you to earn money online completing simple tasks without any upfront fees or hidden costs.",
  },
  {
    question: "How do I earn on Mudralaya?",
    answer:
      "You can choose tasks and earn online by completing daily, weekly, and monthly assignments. Mudralaya offers task completion earning apps in India for verified partners with transparent payouts.",
  },
  {
    question: "Is Mudralaya safe and scam-free?",
    answer:
      "Yes. Mudralaya follows strict compliance standards, verified onboarding, and transparent financial mechanisms to provide a legit task earning platform in India for safe online work.",
  },
  {
    question: "What type of tasks will I get?",
    answer:
      "Tasks range from daily task earning platforms, part-time online earning jobs, work from home task jobs, to structured B2B campaigns. Opportunities are aligned with your skills and location.",
  },
  {
    question: "Will I receive training before starting?",
    answer:
      "Absolutely. Mudralaya is a smart earning platform for students and homemakers, offering training, step-by-step guidance, and task-based earning opportunities before you start earning.",
  },
  {
    question: "Can I work from home?",
    answer:
      "Yes. Mudralaya provides work from home earning ideas without investment, task-based earnings for students in India, and flexible online earning jobs at home for all partners.",
  },
  {
    question: "How and when do I get paid?",
    answer:
      "Payments are processed securely and transparently based on task verification. You can earn daily, weekly, or monthly tasks and receive payouts through compliant fintech methods.",
  },
  {
    question: "Does Mudralaya offer long-term growth?",
    answer:
      "Yes. Partners can grow from completing tasks to building leadership skills and scaling into kiosk or franchise models, making it one of the best online earning apps for beginners in India.",
  },
  {
    question: "Can women or homemakers work with Mudralaya?",
    answer:
      "Definitely. Mudralaya empowers women with earning opportunities for homemakers, flexible work-from-home setups, and zero investment side income tasks, enabling financial independence.",
  },
  {
    question: "How is Mudralaya different from other earning platforms?",
    answer:
      "Mudralaya is a legit, compliance-driven task platform that offers real earning opportunities with transparent payouts, verified tasks, and structured growth. Unlike other sites, it focuses on flexible earning without investment, skill development, and career-building.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={styles.faqContainer}>
      <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
      <div className={styles.faqSubtitle}>
        Questions about earning, tasks, or working from home?<br />
        Our FAQ section explains all the essentials for students, homemakers, and early-career professionals.
      </div>
      <div className={styles.accordionList}>
        {faqData.map((item, idx) => (
          <div key={idx} className={styles.accordionItem}>
            <button
              className={styles.accordionButton}
              onClick={() => handleToggle(idx)}
              aria-expanded={openIndex === idx}
            >
              <span>{item.question}</span>
              <span className={styles.icon}>{openIndex === idx ? "✕" : "+"}</span>
            </button>
            {openIndex === idx && (
              <div className={styles.accordionContent}>
                <div className={styles.faqAnswer}>{item.answer}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
