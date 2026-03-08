"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { adminApiRequest } from "@/lib/adminApi";
import styles from "./blogs.module.css";

interface Blog {
    id: string;
    title: string;
    status: "draft" | "published";
    created_at: string;
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const data = await adminApiRequest("get-blogs");
            setBlogs(data || []);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        try {
            await adminApiRequest("delete-entry", { type: "blog", id });
            setBlogs(blogs.filter((b) => b.id !== id));
        } catch (error: any) {
            alert("Error deleting blog: " + error.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Blogs Management</h1>
                    <p className={styles.subtitle}>
                        Create and manage articles for the public website.
                    </p>
                </div>
                <Link href="/dashboard/blogs/new" className={styles.createBtn}>
                    <Plus size={20} />
                    Create Blog
                </Link>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>Loading blogs...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className={styles.emptyState}>
                                        No blogs found. Create your first post!
                                    </td>
                                </tr>
                            ) : (
                                blogs.map((blog) => (
                                    <tr key={blog.id}>
                                        <td className={styles.blogTitle}>{blog.title}</td>
                                        <td>
                                            <span
                                                className={`${styles.statusBadge} ${blog.status === "published"
                                                    ? styles.published
                                                    : styles.draft
                                                    }`}
                                            >
                                                {blog.status}
                                            </span>
                                        </td>
                                        <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link
                                                    href={`/dashboard/blogs/${blog.id}`}
                                                    className={styles.editBtn}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className={styles.deleteBtn}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
