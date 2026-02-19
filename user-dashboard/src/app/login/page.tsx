"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Lock, Loader2, CheckCircle } from "lucide-react";
import styles from "./login.module.css";
import Image from "next/image";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false); // New state for verification success

  // Timer state
  const [timer, setTimer] = useState(60);
  const [resendAttempts, setResendAttempts] = useState(0);

  const router = useRouter();
  const supabase = createClient();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      }
    };
    checkSession();
  }, [router, supabase.auth]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let formattedPhone = phone.trim();
    // Default to India (+91) if no country code provided
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+91" + formattedPhone;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      if (error) throw error;
      setPhone(formattedPhone); // Update state to correct format for verification
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone,
        token: otp,
        type: "sms",
      });
      if (error) throw error;

      // Verification Successful
      setIsVerified(true);

      // Delay redirect to show success message
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false); // Only stop loading if error, otherwise keep it loading/verified state
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleResendOtp = async () => {
    if (resendAttempts >= 3) return;

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone,
      });
      if (error) throw error;
      setTimer(60);
      setResendAttempts((prev) => prev + 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoneNumber = () => {
    setStep("phone");
    setOtp("");
    setTimer(60);
    setResendAttempts(0);
    setError(null);
    if (phone.startsWith("+91")) {
      setPhone(phone.slice(3));
    }
  };

  return (
    <div className={styles.loginWrapper}>
      {/* Decorative Background Elements */}
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>
      <div className={styles.blob3}></div>

      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <Image
            src="/mudralaya_logo.webp"
            alt="Mudralaya Logo"
            width={120}
            height={60}
            className={styles.logo}
            priority
          />
          <h1>Welcome Back</h1>
          <p>Secure Client Access</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={`${styles.loginFormContainer}`}>
          {isVerified ? (
            <div className={styles.verifiedSuccess}>
              <CheckCircle size={48} className={styles.successIcon} />
              <h2>Verified!</h2>
              <p>Redirecting to dashboard...</p>
            </div>
          ) : step === "phone" ? (
            <form onSubmit={handleSendOtp} className={styles.loginForm}>
              <div className={styles.inputGroup}>
                <span className={styles.phonePrefix}>+91</span>
                <input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  value={phone.replace("+91", "")}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(val);
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || phone.replace("+91", "").length !== 10}
                className={styles.btnPrimary}
              >
                {loading ? (
                  <Loader2 className={styles.spinner} />
                ) : (
                  <>
                    Send OTP <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className={styles.loginForm}>
              <div className={styles.otpSentInfo}>
                <p className={styles.otpSentText}>
                  OTP sent to <strong>{phone}</strong>
                </p>
                <p className={styles.otpDeliveryHint}>
                  You will receive the OTP via SMS or Call.
                </p>
              </div>
              <div className={styles.inputGroup}>
                <Lock className={styles.inputIcon} size={18} />
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={styles.btnPrimary}
              >
                {loading ? (
                  <Loader2 className={styles.spinner} />
                ) : (
                  "Verify & Login"
                )}
              </button>

              <div className={styles.otpActions}>
                {timer > 0 ? (
                  <span className={styles.timerText}>
                    Resend OTP in {timer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    className={`${styles.btnText} ${styles.resendBtn}`}
                    onClick={handleResendOtp}
                    disabled={loading || resendAttempts >= 3}
                  >
                    {resendAttempts >= 3
                      ? "Max attempts reached"
                      : "Resend OTP"}
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`${styles.btnText} ${styles.changePhoneBtn}`}
                onClick={handleChangePhoneNumber}
                disabled={loading}
              >
                Edit Phone Number
              </button>
            </form>
          )}
        </div>

        <div className={styles.loginFooter}>
          <p>
            &copy; {new Date().getFullYear()} Mudralaya Fintech. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
