import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, Calendar, Share2, Twitter, Linkedin, Facebook, User, FolderOpen } from "lucide-react";
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

    const blogUrl = `https://mudralaya.com/blog/${slug}`;
    const encodedUrl = encodeURIComponent(blogUrl);
    const encodedTitle = encodeURIComponent(blog.title);
    const hashtagsForShare = blog.hashtags
        ? blog.hashtags.replace(/#/g, "").split(/\s+/).filter(Boolean).join(",")
        : "";

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}${hashtagsForShare ? `&hashtags=${encodeURIComponent(hashtagsForShare)}` : ""}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;

    const hashtags = blog.hashtags
        ? blog.hashtags.split(/\s+/).filter(Boolean)
        : [];

    return (
        <article className={styles.articlePage}>
            {/* Dynamic Full-Bleed Hero Header */}
            <header
                className={styles.heroHeader}
                style={{
                    backgroundImage: blog.cover_image ? `url(${blog.cover_image})` : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                }}
            >
                <div className={styles.glassOverlay}></div>
                
                <div className={styles.headerContainer}>
                    <Link href="/blog" className={styles.backLink}>
                        <ArrowLeft size={16} /> Back to Journal
                    </Link>

                    {blog.category && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <span className={styles.categoryBadge}>
                                <FolderOpen size={14} /> {blog.category}
                            </span>
                        </div>
                    )}

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
                        {blog.author && (
                            <>
                                <span className={styles.metaDot}>•</span>
                                <span className={styles.metaItem}>
                                    <User size={16} />
                                    {blog.author}
                                </span>
                            </>
                        )}
                    </div>
                    
                    <h1 className={styles.title}>{blog.title}</h1>
                    
                    {blog.excerpt && <p className={styles.excerpt}>{blog.excerpt}</p>}
                </div>
            </header>

            {/* Content Wrapper pulled up over the header like white floating paper */}
            <div className={styles.contentWrapper}>
                <div className={styles.articleBody}>
                    <div
                        className={styles.content}
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Hashtags */}
                    {hashtags.length > 0 && (
                        <div className={styles.hashtagsSection}>
                            {hashtags.map((tag: string, i: number) => (
                                <span key={i} className={styles.hashtag}>
                                    {tag.startsWith("#") ? tag : `#${tag}`}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Footer / Share Section */}
                    <div className={styles.articleFooter}>
                        <div className={styles.shareSection}>
                            <span className={styles.shareText}>
                                <Share2 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Share this article
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Share on Twitter">
                                    <Twitter size={18} />
                                </a>
                                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Share on LinkedIn">
                                    <Linkedin size={18} />
                                </a>
                                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Share on Facebook">
                                    <Facebook size={18} />
                                </a>
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={`${styles.socialBtn} ${styles.whatsappBtn}`} aria-label="Share on WhatsApp">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.644-1.468A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.177-.693-5.821-1.87l-.418-.268-2.752.869.868-2.694-.289-.44A9.797 9.797 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818S21.818 6.577 21.818 12 17.423 21.818 12 21.818z"/></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
