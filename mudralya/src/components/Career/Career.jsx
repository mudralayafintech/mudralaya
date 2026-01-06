import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users,
    Target,
    Zap,
    Heart,
    BarChart,
    Search,
    MapPin,
    Code,
    ShieldCheck,
    Rocket,
    Trophy,
    CheckCircle2,
    Lightbulb,
    Handshake,
    GraduationCap,
    Palette,
    Video,
    Smartphone,
    Box,
    Settings
} from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import './Career.css';

const Career = () => {
    const navigate = useNavigate();
    const { openJoinUsModal } = useModal();

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        initial: {},
        whileInView: { transition: { staggerChildren: 0.1 } },
        viewport: { once: true }
    };

    return (
        <div className="career-page">
            <section className="career-hero">
                <div className="container-xl">
                    <div className="row align-items-center">
                        <motion.div
                            className="col-lg-6 career-hero-content"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="hero-title">
                                Start Your Career <br />
                                in <span className="highlight">Mudralaya</span>
                            </h1>
                            <p className="hero-description">
                                We are the people who dream & do. Join a community where your skills meet real opportunity.
                            </p>
                            <div className="hero-actions d-flex gap-3 mb-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn btn-about-us"
                                    onClick={() => navigate('/about')}
                                >
                                    About us
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn btn-vacancies"
                                    onClick={() => openJoinUsModal()}
                                >
                                    Become our Partner
                                </motion.button>
                            </div>
                        </motion.div>
                        <motion.div
                            className="col-lg-6 career-hero-images"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="image-grid">
                                <div className="main-image">
                                    <img src="/images/about-us.png" alt="Team member" />
                                </div>
                                <div className="side-images">
                                    <div className="side-image-item">
                                        <img src="/images/about-us.png" alt="Office space" />
                                    </div>
                                    <div className="side-image-item">
                                        <img src="/images/about-us.png" alt="Team meeting" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="reasons-section">
                <div className="container-xl">
                    <motion.div
                        className="section-header text-center mb-5"
                        {...fadeInUp}
                    >
                        <h2 className="section-title">Why You Should <span className="highlight">Join Us</span></h2>
                        <p className="section-subtitle">Being a part of Mudralaya means enjoying every working day!</p>
                    </motion.div>

                    <motion.div
                        className="row g-4"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                    >
                        {[
                            { icon: Users, title: "Real Tasks, Real Earnings", desc: "Complete verified tasks online or offline. Earn money after task approval—no fake promises." },
                            { icon: Lightbulb, title: "Freedom & Flexibility", desc: "Choose tasks based on your time, skill, and location. Work daily, weekly, or whenever you want." },
                            { icon: Handshake, title: "Transparent Payments", desc: "Earnings go to your Mudralaya Wallet. Minimum withdrawal: ₹500. No upfront fees." },
                            { icon: GraduationCap, title: "Learn & Grow", desc: "Explore tasks from basic to professional. Improve your skills while earning." }
                        ].map((item, index) => (
                            <div key={index} className="col-md-6 col-lg-3">
                                <motion.div
                                    className="reason-card"
                                    variants={fadeInUp}
                                    whileHover={{ y: -10 }}
                                >
                                    <div className="icon-wrapper">
                                        <item.icon size={32} />
                                        <div className="icon-bg"></div>
                                    </div>
                                    <h3 className="reason-name">{item.title}</h3>
                                    <div className="reason-line"></div>
                                    <p className="reason-description">{item.desc}</p>
                                </motion.div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section className="career-benefits-section">
                <div className="container-xl">
                    <div className="row justify-content-center">
                        <motion.div
                            className="col-lg-10 text-center"
                            {...fadeInUp}
                        >
                            <h2 className="benefits-title">Become a Part of <span className="highlight">Our Team</span></h2>
                            <p className="benefits-lead">
                                Mudralaya offers a stimulating work environment.
                            </p>
                            <div className="benefits-description">
                                <p>
                                    Are you looking for an exciting career opportunity? We are looking for
                                    talented individuals to join our team! We offer competitive salaries,
                                    great benefits, and an opportunity to grow professionally. We are
                                    committed to helping our employees reach their greatest potential.
                                    Come join us and help us make a difference!
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="job-categories-section">
                <div className="container-xl">
                    <motion.div
                        className="row g-4"
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true }}
                    >
                        {[
                            { icon: Code, title: "Web Development", desc: "Full-Stack Developer, Front-End Developer, Back-End Developer." },
                            { icon: Palette, title: "Design & Creative", desc: "Web Designer, UI/UX Designer, Creative Designer, Art Director." },
                            { icon: BarChart, title: "Digital Marketing", desc: "Digital Marketer, SEO Specialist, Content Manager, Writer." },
                            { icon: Video, title: "Animation & Video", desc: "Animator, Character Animator, Video Editor, Video Creator." },
                            { icon: Smartphone, title: "Mobile Development", desc: "JavaScript Application Developer, Senior Mobile Developer." },
                            { icon: Box, title: "3D Development", desc: "3D Animator, Visual Artist, 3D Designer, 3D Generalist." }
                        ].map((item, index) => (
                            <div key={index} className="col-md-6 col-lg-4">
                                <motion.div
                                    className="category-card"
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.03 }}
                                >
                                    <div className="category-icon">
                                        <item.icon size={36} />
                                    </div>
                                    <h3 className="category-title">{item.title}</h3>
                                    <p className="category-description">{item.desc}</p>
                                </motion.div>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div
                        className="career-cta-container text-center mt-5 pt-4"
                        {...fadeInUp}
                    >
                        <p className="cta-title">Interested working with us?</p>
                        <p className="cta-email">Send your CV at <motion.a whileHover={{ scale: 1.05 }} href="mailto:contact@mudralaya.com">contact@mudralaya.com</motion.a></p>
                    </motion.div>
                </div>
            </section>

            <section className="values-section">
                <div className="container-xl">
                    <div className="row align-items-center">
                        <motion.div
                            className="col-lg-6 mb-4 mb-lg-0"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="values-image-wrapper">
                                <img src="/images/carrier.jpg" alt="Working at Mudralaya" className="img-fluid rounded-3" />
                            </div>
                        </motion.div>
                        <motion.div
                            className="col-lg-6 ps-lg-5"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="values-title">Working in Mudralaya Be Like...</h2>
                            <p className="values-lead">Learn more about working in our company.</p>
                            <p className="values-description">
                                Mudralaya is built on trust, flexibility, and real opportunities for everyone. Here’s what makes us different
                            </p>

                            <div className="values-list">
                                {[
                                    { icon: Lightbulb, title: "Real Tasks, Real Earnings", desc: "We connect individuals, shops, and businesses with verified tasks. No fake promises. No scams." },
                                    { icon: Settings, title: "Freedom & Flexibility", desc: "Choose tasks based on your time, skill, and location. Work online or offline—whenever you want." },
                                    { icon: Box, title: "Transparency First", desc: "Every task is tracked and approved before payment. Earnings go to your Mudralaya Wallet." }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="value-item"
                                        whileHover={{ x: 10 }}
                                    >
                                        <div className="value-icon">
                                            <item.icon size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="value-content">
                                            <h4>{item.title}</h4>
                                            <p>{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Career;
