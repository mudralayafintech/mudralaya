"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
import { adminApiRequest } from "@/lib/adminApi";
import styles from "./editor.module.css";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function BlogEditor() {
    const { id } = useParams();
    const router = useRouter();
    const isNew = id === "new";
    const supabase = createClient();

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["blockquote", "code-block"],
            ["link", "image", "video"],
            ["clean"],
        ],
    };

    const handleContentChange = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, content: value }));
    }, []);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        cover_image: "",
        status: "draft",
        seo_title: "",
        seo_description: "",
        primary_keywords: "",
        secondary_keywords: "",
        tags: "",
    });

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isNew) {
            fetchBlog();
        }
    }, [id]);

    const fetchBlog = async () => {
        setError("");
        try {
            const data = await adminApiRequest("get-blog", { blogId: id });
            if (data) {
                setFormData({
                    title: data.title || "",
                    slug: data.slug || "",
                    excerpt: data.excerpt || "",
                    content: data.content || "",
                    cover_image: data.cover_image || "",
                    status: data.status || "draft",
                    seo_title: data.seo_title || "",
                    seo_description: data.seo_description || "",
                    primary_keywords: data.primary_keywords || "",
                    secondary_keywords: data.secondary_keywords || "",
                    tags: data.tags || "",
                });
            }
        } catch (err: any) {
            console.error("Error fetching blog:", err);
            setError("Failed to load blog post.");
        }
        setLoading(false);
    };

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData((prev) => ({
            ...prev,
            title,
            // Auto generate slug only if we are creating a new post and haven't manually edited slug
            slug: isNew ? generateSlug(title) : prev.slug,
        }));
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError("");

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()
                .toString(36)
                .substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `covers/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("blog_images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from("blog_images")
                .getPublicUrl(filePath);

            setFormData((prev) => ({ ...prev, cover_image: data.publicUrl }));
        } catch (err: any) {
            console.error("Image upload failed:", err);
            setError("Image upload failed: " + err.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                title: formData.title,
                slug: formData.slug,
                excerpt: formData.excerpt,
                content: formData.content,
                cover_image: formData.cover_image,
                status: formData.status,
                seo_title: formData.seo_title,
                seo_description: formData.seo_description,
                primary_keywords: formData.primary_keywords,
                secondary_keywords: formData.secondary_keywords,
                tags: formData.tags,
            };

            if (isNew) {
                await adminApiRequest("create-blog", payload);
            } else {
                await adminApiRequest("update-blog", { blogId: id, ...payload });
            }
            router.push("/dashboard/blogs");
        } catch (err: any) {
            console.error("Error saving blog:", err);
            setError(err.message || "Failed to save blog post.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={styles.loading}>Loading editor...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Link href="/dashboard/blogs" className={styles.backBtn}>
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className={styles.title}>
                        {isNew ? "Create New Blog" : "Edit Blog"}
                    </h1>
                </div>
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                {/* Main Content Area */}
                <div className={styles.mainColumn}>
                    <div className={styles.card}>
                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleTitleChange}
                                placeholder="Blog post title"
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="url-friendly-slug"
                                required
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Content</label>
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={handleContentChange}
                                modules={quillModules}
                                style={{ height: "400px", marginBottom: "3rem" }}
                            />
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>SEO Settings</h3>
                        <div className={styles.formGroup}>
                            <label>SEO Title</label>
                            <input
                                type="text"
                                name="seo_title"
                                value={formData.seo_title}
                                onChange={handleChange}
                                placeholder="Title for search engines"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>SEO Description</label>
                            <textarea
                                name="seo_description"
                                value={formData.seo_description}
                                onChange={handleChange}
                                placeholder="Meta description"
                                className={styles.textarea}
                                rows={3}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Primary Keywords</label>
                            <input
                                type="text"
                                name="primary_keywords"
                                value={formData.primary_keywords}
                                onChange={handleChange}
                                placeholder="e.g. fintech, investment, mutual funds"
                                className={styles.input}
                            />
                            <p className={styles.helpText}>Comma-separated main keywords for this post.</p>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Secondary Keywords</label>
                            <input
                                type="text"
                                name="secondary_keywords"
                                value={formData.secondary_keywords}
                                onChange={handleChange}
                                placeholder="e.g. money management, financial literacy"
                                className={styles.input}
                            />
                            <p className={styles.helpText}>Comma-separated supporting keywords.</p>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tags</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="e.g. finance, tips, beginner"
                                className={styles.input}
                            />
                            <p className={styles.helpText}>Comma-separated tags for categorization.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings Area */}
                <div className={styles.sideColumn}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Publishing</h3>

                        <div className={styles.formGroup}>
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={saving || uploadingImage}
                            className={styles.saveBtn}
                        >
                            {saving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {saving ? "Saving..." : "Save Blog"}
                        </button>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Cover Image</h3>

                        {formData.cover_image && (
                            <div className={styles.imagePreview}>
                                <img src={formData.cover_image} alt="Cover" />
                            </div>
                        )}

                        <div className={styles.uploadBox}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                id="coverUpload"
                                style={{ display: "none" }}
                            />
                            <label htmlFor="coverUpload" className={styles.uploadLabel}>
                                {uploadingImage ? (
                                    <Loader2 size={24} className="animate-spin" />
                                ) : (
                                    <ImageIcon size={24} />
                                )}
                                <span>
                                    {uploadingImage ? "Uploading..." : "Click to upload image"}
                                </span>
                            </label>
                        </div>

                        <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                            <label>Or paste Image URL:</label>
                            <input
                                type="text"
                                name="cover_image"
                                value={formData.cover_image}
                                onChange={handleChange}
                                placeholder="https://..."
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Excerpt</h3>
                        <p className={styles.helpText}>
                            A short summary that appears on the blog listing page.
                        </p>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            className={styles.textarea}
                            rows={4}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
