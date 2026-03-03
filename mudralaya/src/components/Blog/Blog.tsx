"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Linkedin, Twitter, Youtube, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./Blog.module.css";

const instaImages = [
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
];

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string;
    created_at: string;
}

const Blog = () => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        const { data, error } = await supabase
            .from("blogs")
            .select("id, title, slug, excerpt, cover_image, created_at")
            .eq("status", "published")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching blogs:", error);
        } else {
            setBlogPosts(data || []);
        }
        setLoading(false);
    };

    const calculateReadTime = (excerpt: string) => {
        const words = excerpt?.split(" ").length || 0;
        const time = Math.max(1, Math.ceil(words / 200) * 3);
        return `${time} min`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const featuredPost = blogPosts.length > 0 ? blogPosts[0] : null;
    const regularPosts = blogPosts.slice(1);

    return (
        <div className={styles.blogPage}>

            <header className={styles.pageHeader}>
                <div className={styles.container}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.pageTitle}
                    >
                        Our Journal
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={styles.pageSubtitle}
                    >
                        Insights, strategies, and stories on digital entrepreneurship and modern business growth.
                    </motion.p>
                </div>
            </header>

            <div className={`${styles.container} ${styles.mainLayout}`}>
                <div className={styles.blogContent}>
                    {loading ? (
                        <div className={styles.loadingState}>Loading latest articles...</div>
                    ) : blogPosts.length === 0 ? (
                        <div className={styles.loadingState}>No articles published yet. Check back soon.</div>
                    ) : (
                        <>
                            {/* Featured Post */}
                            {featuredPost && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredPost}>
                                        <div className={styles.featuredImgBox}>
                                            <img
                                                src={featuredPost.cover_image || "https://images.unsplash.com/photo-1454165833241-279435b6f9f?auto=format&fit=crop&w=800&q=80"}
                                                alt={featuredPost.title}
                                                className={styles.featuredImg}
                                            />
                                        </div>
                                        <div className={styles.featuredContent}>
                                            <div className={styles.meta}>
                                                <span>{formatDate(featuredPost.created_at)}</span>
                                                <span>•</span>
                                                <span>{calculateReadTime(featuredPost.excerpt)} read</span>
                                            </div>
                                            <h2 className={styles.featuredTitle}>{featuredPost.title}</h2>
                                            <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>
                                            <div className={styles.readMoreBtn}>
                                                Read Article <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* Regular Posts Grid */}
                            {regularPosts.length > 0 && (
                                <div className={styles.postsGrid}>
                                    {regularPosts.map((post, i) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <Link href={`/blog/${post.slug}`} className={styles.postCard}>
                                                <div className={styles.postImgBox}>
                                                    <img
                                                        src={post.cover_image || "https://images.unsplash.com/photo-1454165833241-279435b6f9f?auto=format&fit=crop&w=800&q=80"}
                                                        alt={post.title}
                                                        className={styles.postImg}
                                                    />
                                                </div>
                                                <div className={styles.postContent}>
                                                    <div className={styles.meta}>
                                                        <span>{formatDate(post.created_at)}</span>
                                                    </div>
                                                    <h3 className={styles.postTitle}>{post.title}</h3>
                                                    <p className={styles.postExcerpt}>{post.excerpt}</p>
                                                    <div className={styles.readMoreBtn}>
                                                        Read More <ArrowRight size={16} />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={styles.newsletterCard}
                    >
                        <h2 className={styles.newsletterTitle}>Stay Updated</h2>
                        <p className={styles.newsletterSubtitle}>Get our latest posts delivered fresh to your inbox.</p>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className={styles.newsletterInput}
                        />
                        <button className={styles.subscribeBtn}>Subscribe Now</button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className={styles.sidebarCard}
                    >
                        <h3 className={styles.sidebarTitle}>Follow Us</h3>
                        <div className={styles.instaGrid}>
                            {instaImages.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`instagram-${i}`}
                                    className={styles.instaImg}
                                />
                            ))}
                        </div>
                        <div className={styles.sidebarSocials}>
                            <Instagram size={22} />
                            <Linkedin size={22} />
                            <Twitter size={22} />
                            <Youtube size={22} />
                        </div>
                    </motion.div>
                </aside>
            </div>

            {/* Contact Section */}
            <section className={styles.contactSection}>
                <div className={styles.container}>
                    <h2 className={styles.contactTitle}>Let's Talk Business</h2>
                    <p className={styles.contactSubtitle}>Have a question? We'd love to hear from you.</p>
                    <form className={styles.contactForm}>
                        <input
                            type="text"
                            placeholder="First Name"
                            className={styles.inputField}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            className={styles.inputField}
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className={`${styles.inputField} ${styles.fullWidth}`}
                            required
                        />
                        <textarea
                            placeholder="How can we help you?"
                            className={`${styles.inputField} ${styles.fullWidth}`}
                            style={{ height: "140px", resize: "vertical" }}
                        ></textarea>
                        <div className={styles.fullWidth} style={{ textAlign: "center", marginTop: "16px" }}>
                            <button type="submit" className={styles.formSubmitBtn}>
                                Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Blog;
