"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Linkedin, Twitter, Youtube, ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./Blog.module.css";

const instaImages = [
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80",
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
            {/* Background Effects */}
            <div className={styles.bgGradientBlob1}></div>
            <div className={styles.bgGradientBlob2}></div>

            <header className={styles.pageHeader}>
                <div className={styles.container}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className={styles.headerBadge}
                    >
                        Insights & Updates
                    </motion.div>
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
                        Discover profound insights, strategies, and stories on digital entrepreneurship and modern business growth.
                    </motion.p>
                </div>
            </header>

            <div className={`${styles.container} ${styles.mainLayout}`}>
                <div className={styles.blogContent}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.loadingSpinner}></div>
                            Loading our latest curations...
                        </div>
                    ) : blogPosts.length === 0 ? (
                        <div className={styles.loadingState}>No articles published yet. Check back soon.</div>
                    ) : (
                        <>
                            {/* Featured Hero Post */}
                            {featuredPost && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className={styles.featuredContainer}
                                >
                                    <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredHeroCard}>
                                        <div className={styles.featuredHeroImageWrapper}>
                                            <div className={styles.imageOverlay}></div>
                                            <img
                                                src={featuredPost.cover_image || "https://images.unsplash.com/photo-1454165833241-279435b6f9f?auto=format&fit=crop&w=1200&q=80"}
                                                alt={featuredPost.title}
                                                className={styles.featuredHeroImage}
                                            />
                                        </div>
                                        <div className={styles.featuredHeroContent}>
                                            <div className={styles.metaGlass}>
                                                <span className={styles.metaPill}>
                                                    <Calendar size={14} /> {formatDate(featuredPost.created_at)}
                                                </span>
                                                <span className={styles.metaPill}>
                                                    <Clock size={14} /> {calculateReadTime(featuredPost.excerpt)} read
                                                </span>
                                            </div>
                                            <h2 className={styles.featuredHeroTitle}>{featuredPost.title}</h2>
                                            <p className={styles.featuredHeroExcerpt}>{featuredPost.excerpt}</p>
                                            <div className={styles.glowReadBtn}>
                                                Read Featured Article <ArrowRight size={18} />
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
                                            viewport={{ once: true, margin: "-50px" }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <Link href={`/blog/${post.slug}`} className={styles.glassPostCard}>
                                                <div className={styles.postImgBox}>
                                                    <img
                                                        src={post.cover_image || "https://images.unsplash.com/photo-1454165833241-279435b6f9f?auto=format&fit=crop&w=800&q=80"}
                                                        alt={post.title}
                                                        className={styles.postImg}
                                                    />
                                                    <div className={styles.postHoverOverlay}></div>
                                                </div>
                                                <div className={styles.postContent}>
                                                    <div className={styles.cardMeta}>
                                                        <span>{formatDate(post.created_at)}</span>
                                                        <span className={styles.dot}>•</span>
                                                    </div>
                                                    <h3 className={styles.postTitle}>{post.title}</h3>
                                                    <p className={styles.postExcerpt}>{post.excerpt}</p>
                                                    <div className={styles.linkRow}>
                                                        Read Journey <ArrowRight size={16} />
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
                        className={styles.glassSidebarCard}
                    >
                        <div className={styles.newsletterIconWrapper}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </div>
                        <h2 className={styles.newsletterTitle}>Stay Updated</h2>
                        <p className={styles.newsletterSubtitle}>Join our premium mailing list for exclusive strategies and insights.</p>
                        <div className={styles.newsletterForm}>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className={styles.glassInput}
                            />
                            <button className={styles.primaryBtn}>Subscribe</button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className={styles.glassSidebarCard}
                    >
                        <h3 className={styles.sidebarTitle}>Follow the Journey</h3>
                        <div className={styles.instaGrid}>
                            {instaImages.map((img, i) => (
                                <div key={i} className={styles.instaWrapper}>
                                    <img
                                        src={img}
                                        alt={`instagram-${i}`}
                                        className={styles.instaImg}
                                    />
                                    <div className={styles.instaOverlay}>
                                        <Instagram size={18} color="white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.sidebarSocials}>
                            <a href="#" className={styles.socialIcon}><Instagram size={20} /></a>
                            <a href="#" className={styles.socialIcon}><Linkedin size={20} /></a>
                            <a href="#" className={styles.socialIcon}><Twitter size={20} /></a>
                            <a href="#" className={styles.socialIcon}><Youtube size={20} /></a>
                        </div>
                    </motion.div>
                </aside>
            </div>
        </div>
    );
};

export default Blog;
