"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useAuth } from "@/context/AuthContext";
import styles from "./Header.module.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { openLoginModal } = useUI();
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Career", href: "/career" },
    { name: "Contact Us", href: "/contact" },
  ];

  const isHomePage = pathname === "/";
  const headerThemeClass = !isHomePage || scrolled ? styles.scrolled : "";

  return (
    <header className={`${styles.header} ${headerThemeClass}`}>
      <div className="container">
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/images/mudralya_logo.webp"
              alt="Mudralaya"
              width={160}
              height={40}
              className={styles.logoImg}
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.navLink} ${pathname === link.href ? styles.active : ""
                    }`}
                >
                  {link.name}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="underline"
                      className={styles.underline}
                    />
                  )}
                </Link>
              </li>
            ))}
            <li className={styles.authItem}>
              {user ? (
                <Link
                  href={
                    process.env.NEXT_PUBLIC_DASHBOARD_URL ||
                    "https://user.mudralaya.com"
                  }
                  className={styles.dashboardBtn}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="https://user.mudralaya.com"
                  className={styles.loginBtn}
                >
                  Login
                </Link>
              )}
            </li>
          </ul>

          {/* Mobile Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isNavOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNavOpen(false)}
              className={styles.mobileOverlay}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={styles.mobileNav}
            >
              <div className={styles.mobileNavHeader}>
                <Image
                  src="/images/mudralya_logo.webp"
                  alt="Mudralaya"
                  width={140}
                  height={35}
                  className={styles.mobileLogo}
                />
                <button
                  className={styles.closeBtn}
                  onClick={() => setIsNavOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <ul className={styles.mobileNavLinks}>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`${styles.mobileNavLink} ${pathname === link.href ? styles.activeMobile : ""
                        }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  {user ? (
                    <Link
                      href={
                        process.env.NEXT_PUBLIC_DASHBOARD_URL ||
                        "https://user.mudralaya.com"
                      }
                      className={styles.mobileDashboardBtn}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="https://user.mudralaya.com"
                      className={styles.mobileLoginBtn}
                    >
                      Login
                    </Link>
                  )}
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header >
  );
};

export default Header;
