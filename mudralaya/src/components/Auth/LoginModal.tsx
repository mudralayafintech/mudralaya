"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUI } from "@/context/UIContext";
import styles from "./LoginModal.module.css";

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal } = useUI();
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleClose = () => {
    setStep(1);
    setMobileNumber("");
    setOtp("");
    setError("");
    setSuccessMessage("");
    closeLoginModal();
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: `+91${mobileNumber}`,
      });
      if (otpError) throw otpError;

      setStep(2);
      setSuccessMessage(`OTP sent to +91 ${mobileNumber}`);
    } catch (err) {
      setError((err as Error).message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const {
        error: verifyError,
      } = await supabase.auth.verifyOtp({
        phone: `+91${mobileNumber}`,
        token: otp,
        type: "sms",
      });

      if (verifyError) throw verifyError;

      setSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        const dashboardUrl =
          process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://user.mudralaya.com";
        window.location.href = dashboardUrl;
      }, 1500);
    } catch (err) {
      setError((err as Error).message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const dashboardUrl =
        process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://user.mudralaya.com";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${dashboardUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError((err as Error).message || 'Failed to sign in with Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={handleClose}>
              <X size={20} />
            </button>

            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <Smartphone size={24} className={styles.icon} />
              </div>
              <h2>Welcome Back</h2>
              <p>Enter your mobile number to sign in</p>
            </div>

            <div className={styles.body}>
              {error && <div className={styles.error}>{error}</div>}
              {successMessage && (
                <div className={styles.success}>
                  <CheckCircle2 size={16} />
                  {successMessage}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSendOTP} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>Mobile Number</label>
                    <div className={styles.phoneInput}>
                      <span className={styles.prefix}>+91</span>
                      <input
                        type="tel"
                        placeholder="Enter 10 digit number"
                        value={mobileNumber}
                        onChange={(e) =>
                          setMobileNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 10)
                          )
                        }
                        required
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || mobileNumber.length !== 10}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        Get OTP <ArrowRight size={18} />
                      </>
                    )}
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
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Continue with Google
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>Enter 6-digit OTP</label>
                    <input
                      type="text"
                      placeholder="······"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      required
                      className={styles.input}
                      autoFocus
                    />
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className={styles.textBtn}
                    >
                      Change Number?
                    </button>
                  </div>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Verify & Login"
                    )}
                  </button>
                </form>
              )}
            </div>

            <p className={styles.footer}>
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
