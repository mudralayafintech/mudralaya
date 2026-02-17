"use client";

import React from "react";
import { motion } from "framer-motion";
import { Instagram, Linkedin, Twitter, Youtube, Send } from "lucide-react";
import styles from "./Blog.module.css";

const blogPosts = [
    {
        id: 1,
        title: "Top street markets in the Middle East",
        excerpt: "Discover the vibrant culture and unique trading traditions of Middle Eastern street markets...",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        date: "Mar 8",
        readTime: "2 min",
    },
    {
        id: 2,
        title: "Starting fresh: New Year resolutions",
        excerpt: "How to set and maintain professional goals that drive real career growth in the digital age...",
        image: "https://images.unsplash.com/photo-1454165833241-279435b6f9f?auto=format&fit=crop&w=800&q=80",
        date: "Mar 8",
        readTime: "2 min",
    },
    {
        id: 3,
        title: "Join the re-commerce revolution",
        excerpt: "The future of sustainable business lies in circular economies and re-commerce platform...",
        image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
        date: "Mar 8",
        readTime: "2 min",
    }
];

const instaImages = [
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
];

const Blog = () => {
    return (
        <div className={styles.blogPage}>
            {/* Hero Grid */}
            <div className={styles.heroGrid}>
                <div className={styles.heroImageBox}>
                    <img src="https://img.freepik.com/free-photo/portrait-businesswoman-sitting-office-with-money-working-making-profit-income-posing-happy_1258-87600.jpg" alt="Hero 1" className={styles.heroImg} />
                </div>
                <div className={styles.heroImageBox}>
                    <img src="https://img.freepik.com/free-photo/portrait-businesswoman-sitting-office-with-money-working-making-profit-income-posing-happy_1258-87600.jpg" alt="Hero 2" className={styles.heroImg} />
                </div>
                <div className={styles.heroImageBox}>
                    <img src="https://img.freepik.com/free-photo/portrait-businesswoman-sitting-office-with-money-working-making-profit-income-posing-happy_1258-87600.jpg" alt="Hero 3" className={styles.heroImg} />
                </div>
            </div>

            {/* Page Title */}
            <div className={styles.pageTitleSection}>
                <h1 className={styles.pageTitle}>Earn Money Online</h1>
            </div>

            <div className={styles.mainLayout}>
                {/* Blog List */}
                <div className={styles.blogList}>
                    {blogPosts.map((post) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className={styles.blogCard}
                        >
                            <div className={styles.blogCardImgBox}>
                                <img src={post.image} alt={post.title} className={styles.blogCardImg} />
                            </div>
                            <div className={styles.blogCardContent}>
                                <span className={styles.cardMeta}>{post.date} • {post.readTime}</span>
                                <h3 className={styles.cardTitle}>{post.title}</h3>
                                <p className={styles.cardExcerpt}>{post.excerpt}</p>
                            </div>
                        </motion.div>
                    ))}
                    <button className={styles.allPostsBtn}>All Posts</button>
                </div>

                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    {/* Subscribe */}
                    <div className={styles.sidebarSection}>
                        <div className={styles.newsletterCard}>
                            <h2 className={styles.newsletterTitle}>Let the posts<br />come to you.</h2>
                            <input type="email" placeholder="Email *" className={styles.newsletterInput} />
                            <button className={styles.subscribeBtn}>Subscribe</button>
                        </div>
                    </div>

                    {/* Instagram */}
                    <div className={styles.sidebarSection}>
                        <h3 className={styles.sidebarTitle}>Find me on Instagram</h3>
                        <div className={styles.instaGrid}>
                            {instaImages.map((img, i) => (
                                <img key={i} src={img} alt={`instagram-${i}`} className={styles.instaImg} />
                            ))}
                        </div>
                        <div className={styles.sidebarSocials}>
                            <Instagram size={20} />
                            <Linkedin size={20} />
                            <Twitter size={20} />
                            <Youtube size={20} />
                        </div>
                    </div>
                </aside>
            </div>

            {/* Contact Section */}
            <section className={styles.contactSection}>
                <div className="container">
                    <h2 className={styles.contactTitle}>Let me know what&apos;s on your mind</h2>
                    <form className={styles.contactForm}>
                        <input type="text" placeholder="First Name" className={styles.inputField} />
                        <input type="text" placeholder="Last Name" className={styles.inputField} />
                        <input type="email" placeholder="Email *" className={`${styles.inputField} ${styles.fullWidth}`} required />
                        <textarea placeholder="Leave us a message..." className={`${styles.inputField} ${styles.fullWidth}`} style={{ height: '100px' }}></textarea>
                        <div className={`${styles.submitSection} ${styles.fullWidth}`}>
                            <button type="submit" className={styles.formSubmitBtn}>Submit</button>
                        </div>
                    </form>
                </div>
            </section>


        </div>
    );
};

export default Blog;
