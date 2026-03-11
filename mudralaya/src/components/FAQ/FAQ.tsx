"use client";
import React, { useState } from "react";
import styles from "./Faq.module.css";

const faqData = [
  {
    question: "What is Mudralaya Fintech and how does it work?",
    answer:
      "Mudralaya Fintech is a partner-based earning ecosystem that connects verified local partners (workers) with trusted B2B companies that need on-ground support. Unlike gig or task-based apps, Mudralaya focuses on structured earning, skill development, and long-term growth. Individuals register as verified partners, receive guided opportunities, and work with companies in a transparent and secure system. Mudralaya ensures fair processes, structured payouts, and career-building opportunities—especially for people in Tier 2 and Tier 3 cities where reliable income options are limited.",
  },
  {
    question: "Is Mudralaya a task app or gig work platform?",
    answer:
      "No, Mudralaya is not a task app, daily gig platform, or cheap labor marketplace. It is a structured partner ecosystem designed for sustainable income growth. Instead of one-time random tasks, partners receive organized earning opportunities connected to real businesses. The focus is on professional growth, verified opportunities, and safe collaboration between companies and individuals. Mudralaya builds long-term earning potential rather than short-term, unstable gig income.",
  },
  {
    question: "How can I earn through Mudralaya?",
    answer:
      "You can earn through Mudralaya by registering as a verified local partner and accessing structured opportunities from B2B companies. These opportunities may include business support services, field operations, assisted services, and other professional assignments. Earnings depend on the type of opportunity and your engagement level. Mudralaya ensures transparent processes, defined roles, and clear earning structures so that partners can build consistent income instead of relying on unpredictable daily gigs.",
  },
  {
    question: "Who can join Mudralaya as a partner?",
    answer:
      "Anyone who is motivated to earn, learn, and grow professionally can apply to become a Mudralaya partner. The platform is especially beneficial for individuals in Tier 2 and Tier 3 cities who are looking for structured earning opportunities. Whether you are a student, freelancer, field worker, or someone seeking stable side income, Mudralaya provides a verified ecosystem that values professionalism, skill development, and long-term growth over informal labor.",
  },
  {
    question: "Is Mudralaya safe and legitimate?",
    answer:
      "Yes, Mudralaya Fintech is built on transparency, structured processes, and verified partnerships. The platform bridges trusted B2B companies with verified individuals, reducing risks commonly seen in informal gig markets. Every opportunity is system-driven and structured, ensuring clarity in expectations and earnings. Mudralaya's goal is to create a safe and organized earning ecosystem rather than unregulated freelance or task-based work environments.",
  },
  {
    question: "How is Mudralaya different from freelancing platforms?",
    answer:
      "Traditional freelancing platforms connect clients and freelancers for independent projects, often requiring bidding and price competition. Mudralaya, on the other hand, creates structured earning pathways through business partnerships. There is no race to undercut prices. Instead, partners are verified and matched with relevant business opportunities. The focus is on stability, transparency, and skill-building rather than unpredictable freelance competition.",
  },
  {
    question: "Does Mudralaya provide skill development opportunities?",
    answer:
      "Yes, Mudralaya is not just about earning—it also focuses on skill development and professional growth. Partners gain hands-on exposure to business operations, structured workflows, and real company processes. Over time, this experience builds career value and opens doors to larger opportunities. Mudralaya's model ensures that individuals do not remain in low-growth roles but instead develop capabilities that enhance long-term earning potential.",
  },
  {
    question: "What types of companies work with Mudralaya?",
    answer:
      "Mudralaya collaborates with B2B companies that require verified local execution partners for their operations. These businesses may include financial services companies, service providers, field operations firms, and other structured enterprises. Instead of hiring informal workers, companies use Mudralaya to access a verified and organized partner network, ensuring professionalism, accountability, and transparent workflows.",
  },
  {
    question: "Can Mudralaya help people in Tier 2 and Tier 3 cities earn better?",
    answer:
      "Yes, Mudralaya is specifically designed to empower individuals in Tier 2 and Tier 3 cities where genuine and structured income opportunities are limited. By bridging the gap between growing businesses and local talent, Mudralaya creates accessible earning pathways without requiring relocation. This helps individuals build careers within their own communities while gaining exposure to organized business ecosystems.",
  },
  {
    question: "Is Mudralaya suitable as a full-time career option?",
    answer:
      "Mudralaya can serve as a structured earning platform that grows into a long-term opportunity depending on partner involvement and performance. Unlike unstable gig apps, the ecosystem encourages consistency, skill-building, and professional engagement. Many partners use Mudralaya to create sustainable income streams while developing career-relevant experience that supports future growth.",
  },
  {
    question: "How does Mudralaya ensure transparent earnings?",
    answer:
      "Mudralaya follows a structured system where roles, expectations, and earning mechanisms are clearly defined. Since the platform connects verified partners with legitimate B2B companies, there is clarity in work scope and compensation structure. This reduces misunderstandings and ensures that partners operate within a professional framework rather than informal or uncertain arrangements.",
  },
  {
    question: "Why is Mudralaya considered a growth ecosystem rather than just an earning app?",
    answer:
      "Mudralaya goes beyond income generation. It builds a professional ecosystem that integrates earning, skill development, business exposure, and structured growth. Partners are treated as collaborators, not disposable labor. The system emphasizes long-term value creation, verified opportunities, and career progression. This makes Mudralaya a growth platform rather than a temporary task or gig solution.",
  },
  {
    question: "How do I register as a partner on Mudralaya?",
    answer:
      "To register as a partner on Mudralaya, you need to complete a structured onboarding process through the official platform. This typically includes basic profile verification, documentation, and understanding platform guidelines. Mudralaya focuses on verified and serious individuals who are ready to engage professionally. The goal is not just quick sign-ups, but building a reliable partner network that companies can trust for long-term collaboration and structured earning opportunities.",
  },
  {
    question: "Does Mudralaya require prior experience to join?",
    answer:
      "No, prior experience is not always mandatory. Mudralaya is designed to create opportunities for individuals who are willing to learn and grow. While some assignments may require specific skills, many opportunities are structured to help partners gain real-world exposure. The platform encourages skill development and professional behavior, allowing individuals from Tier 2 and Tier 3 cities to enter structured earning pathways even without extensive previous experience.",
  },
  {
    question: "What kind of earning opportunities are available on Mudralaya?",
    answer:
      "Mudralaya offers structured earning opportunities connected to B2B business needs. These may include assisted services, field support roles, operational tasks, onboarding assistance, and other professional assignments. Unlike random gig work, these roles are organized and aligned with business processes. The emphasis is on consistency, reliability, and long-term engagement rather than one-time micro tasks or unpredictable short-term jobs.",
  },
  {
    question: "How does Mudralaya support long-term career growth?",
    answer:
      "Mudralaya supports long-term career growth by exposing partners to structured business operations and professional workflows. Over time, partners gain practical experience, communication skills, operational understanding, and industry knowledge. This exposure increases their employability and earning potential. Instead of remaining in low-growth informal work, partners build transferable skills that can open doors to higher-level opportunities and career advancement.",
  },
  {
    question: "Is Mudralaya suitable for students or part-time earners?",
    answer:
      "Yes, Mudralaya can be suitable for students and individuals seeking part-time income, provided they can commit responsibly to assigned roles. The structured nature of the platform allows individuals to balance earning with other responsibilities. At the same time, students gain professional exposure that enhances their resumes and builds real-world experience beyond academic learning.",
  },
  {
    question: "How does Mudralaya verify its partners?",
    answer:
      "Mudralaya follows a verification process to ensure authenticity, accountability, and professionalism. This may include identity verification, documentation checks, and compliance with platform standards. The purpose of verification is to create a trusted ecosystem where companies feel confident assigning responsibilities, and partners operate within a secure and transparent environment.",
  },
  {
    question: "How does Mudralaya benefit B2B companies?",
    answer:
      "Mudralaya provides B2B companies with access to a verified and organized local partner network. Instead of hiring informal workers or managing fragmented gig labor, companies can work within a structured system. This reduces operational risks, improves accountability, and ensures consistent execution. Mudralaya acts as a bridge, simplifying local workforce engagement while maintaining transparency and professionalism.",
  },
  {
    question: "Does Mudralaya charge partners any hidden fees?",
    answer:
      "Mudralaya focuses on transparency and structured processes. Any platform terms, policies, or requirements are clearly communicated during onboarding. The platform is built on trust and long-term collaboration, so hidden charges or misleading fee structures do not align with its ecosystem philosophy. Partners are encouraged to review official guidelines to understand all applicable policies.",
  },
  {
    question: "Can Mudralaya help improve financial stability?",
    answer:
      "Yes, Mudralaya is designed to create structured earning pathways that can contribute to improved financial stability. Unlike unstable gig platforms where income fluctuates unpredictably, Mudralaya emphasizes organized opportunities and professional engagement. With consistent participation and performance, partners can build more reliable income streams over time.",
  },
  {
    question: "Is Mudralaya available across India?",
    answer:
      "Mudralaya is focused on expanding structured earning opportunities, particularly in Tier 2 and Tier 3 cities across India. Availability may vary depending on business demand and operational presence in specific regions. The goal is to bridge local talent with growing businesses, creating decentralized earning opportunities without forcing migration to metro cities.",
  },
  {
    question: "How does Mudralaya maintain transparency between companies and partners?",
    answer:
      "Mudralaya operates through defined roles, structured workflows, and clear communication channels. Expectations, responsibilities, and earning mechanisms are outlined within the system. This minimizes misunderstandings and ensures accountability on both sides. Transparency is a foundational principle of the ecosystem, helping build long-term trust among all stakeholders.",
  },
  {
    question: "What makes Mudralaya different from daily wage or informal work?",
    answer:
      "Unlike daily wage or informal labor markets, Mudralaya offers a structured and professional environment. Roles are aligned with business processes, and partners are verified before engagement. Instead of unpredictable daily hiring, individuals participate in organized opportunities that contribute to skill growth, stability, and long-term earning potential.",
  },
  {
    question: "Can women and homemakers join Mudralaya?",
    answer:
      "Yes, Mudralaya provides opportunities for women and homemakers who are looking to earn in a structured and safe environment. The platform's verification and organized processes help ensure transparency and professionalism. Depending on availability and skills, individuals can participate in opportunities that align with their schedules and career goals.",
  },
  {
    question: "Does Mudralaya provide training or guidance?",
    answer:
      "Mudralaya supports partners by guiding them through structured workflows and professional expectations. While specific training may depend on the opportunity, partners gain hands-on learning through real assignments. This practical exposure helps individuals understand business operations, improve communication skills, and build confidence in professional environments.",
  },
  {
    question: "How quickly can someone start earning after joining Mudralaya?",
    answer:
      "The timeline for starting earnings depends on verification completion, availability of opportunities, and regional demand. Once onboarding is completed and opportunities are assigned, partners can begin engaging in structured roles. Mudralaya prioritizes matching verified partners with relevant business needs rather than rushing unverified sign-ups.",
  },
  {
    question: "Is Mudralaya a secure platform for payments?",
    answer:
      "Mudralaya is designed to operate within a structured and transparent system. Payment processes are aligned with defined business agreements and role structures. By bridging verified companies and verified partners, the platform reduces uncertainty commonly associated with informal earning channels and ensures clarity around compensation mechanisms.",
  },
  {
    question: "Can Mudralaya help reduce unemployment in smaller cities?",
    answer:
      "Yes, Mudralaya aims to address the gap between growing businesses and underutilized local talent in smaller cities. By creating structured earning opportunities within local communities, the platform contributes to decentralized economic participation. This helps individuals build careers without relocating to major metropolitan areas.",
  },
  {
    question: "Why should someone choose Mudralaya over other earning platforms?",
    answer:
      "Mudralaya stands out because it is not a task app, not cheap labor, and not an unstable gig marketplace. It is a trusted growth ecosystem focused on structured income, skill development, transparency, and long-term career building. Individuals who want professional growth and reliable earning pathways find greater value in Mudralaya's organized and verified approach compared to informal alternatives.",
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
