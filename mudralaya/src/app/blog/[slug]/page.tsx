import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, Calendar, Share2, Twitter, Linkedin, Facebook } from "lucide-react";
import Link from "next/link";
import styles from "./BlogDetail.module.css";
import { Metadata, ResolvingMetadata } from "next";

interface Props {
    params: { slug: string };
}

// Generate Dynamic Metadata for SEO
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;

    const { data: blog } = await supabase
        .from("blogs")
        .select("title, excerpt, cover_image, seo_title, seo_description, primary_keywords, secondary_keywords")
        .eq("slug", slug)
        .single();

    if (!blog) {
        return {
            title: "Blog Not Found | Mudralaya",
        };
    }

    const previousImages = (await parent).openGraph?.images || [];

    const allKeywords = [blog.primary_keywords, blog.secondary_keywords]
        .filter(Boolean)
        .join(", ");

    return {
        title: blog.seo_title || `${blog.title} | Mudralaya Blog`,
        description: blog.seo_description || blog.excerpt,
        ...(allKeywords ? { keywords: allKeywords } : {}),
        openGraph: {
            title: blog.seo_title || blog.title,
            description: blog.seo_description || blog.excerpt,
            images: blog.cover_image ? [blog.cover_image, ...previousImages] : previousImages,
        },
    };
}

// Fetch blog data
async function getBlog(slug: string) {
    const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error || !data) {
        return null;
    }
    return data;
}

const calculateReadTime = (htmlContent: string) => {
    // Strip HTML tags roughly to count text length
    const text = htmlContent.replace(/<[^>]*>?/gm, "");
    const words = text.split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 200));
    return `${time} min read`;
};

export default async function BlogPage({ params }: Props) {
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog) {
        notFound();
    }

    return (
        <article className={styles.articlePage}>
            {/* Dark Premium Hero Header */}
            <header className={styles.heroHeader}>
                <div className={styles.headerContainer}>
                    <Link href="/blog" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to Journal
                    </Link>
                    <div className={styles.meta}>
                        <span className={styles.metaItem}>
                            <Calendar size={16} />
                            {new Date(blog.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric"
                            })}
                        </span>
                        <span className={styles.metaDot}>•</span>
                        <span className={styles.metaItem}>
                            <Clock size={16} />
                            {calculateReadTime(blog.content)}
                        </span>
                    </div>
                    <h1 className={styles.title}>{blog.title}</h1>
                    {blog.excerpt && <p className={styles.excerpt}>{blog.excerpt}</p>}
                </div>
            </header>

            {/* Content Wrapper pulled up over the header */}
            <div className={styles.contentWrapper}>
                {blog.cover_image && (
                    <div className={styles.heroImageContainer}>
                        <img
                            src={blog.cover_image}
                            alt={blog.title}
                            className={styles.heroImage}
                        />
                    </div>
                )}

                <div className={styles.articleBody}>
                    <div
                        className={styles.content}
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Footer / Share Section */}
                    <div className={styles.articleFooter}>
                        <div className={styles.shareSection}>
                            <span className={styles.shareText}>
                                <Share2 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Share this article
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className={styles.socialBtn} aria-label="Share on Twitter">
                                    <Twitter size={18} />
                                </button>
                                <button className={styles.socialBtn} aria-label="Share on LinkedIn">
                                    <Linkedin size={18} />
                                </button>
                                <button className={styles.socialBtn} aria-label="Share on Facebook">
                                    <Facebook size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
