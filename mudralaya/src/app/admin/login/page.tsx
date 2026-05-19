"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApiRequest } from "@/lib/adminApi";
import { createClient } from "@/utils/supabase/client";
import styles from "./Login.module.css";
import { Eye, EyeOff, Lock, User, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check if user came back from Google OAuth with a session
  useEffect(() => {
    const checkGoogleSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        // User logged in via Google — verify against admin_users
        try {
          const res = await adminApiRequest("login-google", {
            email: session.user.email,
            google_uid: session.user.id,
          });

          const token = res?.token || res;
          const role = res?.role || "admin";
          const returnedUsername = res?.username || session.user.email;

          if (token && typeof token === "string") {
            localStorage.setItem("adminToken", token);
            localStorage.setItem("adminRole", role);
            localStorage.setItem("adminUsername", res?.display_name || returnedUsername);
            router.push("/admin/dashboard");
          }
        } catch (err: any) {
          // Not an admin user — sign them out and show error
          await supabase.auth.signOut();
          setError("This Google account is not authorized for admin access.");
        }
      }
    };
    checkGoogleSession();
  }, [router, supabase.auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await adminApiRequest("login", {
        username,
        password,
      });

      const token = res?.token || res;
      const role = res?.role || "super_admin";
      const returnedUsername = res?.username || "Super Admin";

      if (token && typeof token === "string") {
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminRole", role);
        localStorage.setItem("adminUsername", returnedUsername);

        console.log("Logged in successfully as", role);
        router.push("/admin/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError((err as Error).message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/login`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/mudralya_logo.webp"
            alt="Mudralaya"
            className={styles.logo}
          />
          <h1 className={styles.title}>Admin Portal</h1>
          <p className={styles.subtitle}>Sign in to manage your dashboard</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={20} />
              <input
                type="text"
                className={styles.inputWithIcon}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={20} />
              <input
                type={showPassword ? "text" : "password"}
                className={styles.inputWithIcon}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Divider */}
          <div className={styles.divider}>
            <span>or</span>
          </div>

          {/* Google Login */}
          <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className={styles.spinner} size={18} />
            ) : (
              <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
