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
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
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
        data: { session },
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
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
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
