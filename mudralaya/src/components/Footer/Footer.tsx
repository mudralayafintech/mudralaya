"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Send,
  Loader2,
} from "lucide-react";
import styles from "./Footer.module.css";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Implement with Supabase client
    setTimeout(() => {
      setSubmitting(false);
      setEmail("");
      alert("Thank you for subscribing!");
    }, 1000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Brand Section */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <img
                src="/images/mudralya_logo.webp"
                alt="Mudralaya"
                className={styles.logoImg}
              />
            </Link>
            <p className={styles.copyright}>
              © {currentYear} Mudralaya Fintech. <br />
              All rights reserved.
            </p>
            <div className={styles.socials}>
              <a
                href="https://www.instagram.com/mudralaya?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                className={styles.socialIcon}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.linkedin.com/company/mudralaya/posts/?feedView=all"
                className={styles.socialIcon}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={20} />
              </a>
              <a href="#" className={styles.socialIcon} aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className={styles.linksGrid}>
            <div className={styles.linkGroup}>
              <h6 className={styles.title}>Company</h6>
              <ul className={styles.list}>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/contact">Contact Us</Link>
                </li>
                <li>
                  <Link href="/career">Careers</Link>
                </li>
              </ul>
            </div>
            <div className={styles.linkGroup}>
              <h6 className={styles.title}>Support</h6>
              <ul className={styles.list}>
                <li>
                  <Link href="/contact">Help Center</Link>
                </li>
                <Link href="/terms-of-service">Terms of Service</Link>
                <li>
                  <Link href="/privacy-policy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#legal">Legal</Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className={styles.newsletter}>
            <h6 className={styles.title}>Stay up to date</h6>
            <p className={styles.newsletterText}>
              Get the latest updates and financial tips directly in your inbox.
            </p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  className={styles.submitBtn}
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
