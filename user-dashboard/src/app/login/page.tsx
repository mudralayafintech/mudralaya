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
  const [googleLoading, setGoogleLoading] = useState(false);
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
      // Add a 10 second timeout
      const timeoutPromise = new Promise<{ error: Error }>((_, reject) => {
        setTimeout(() => reject(new Error("Connection to server timed out. Please check your internet or VPN.")), 10000);
      });

      const { error } = await Promise.race([
        supabase.auth.signInWithOtp({
          phone: formattedPhone,
        }),
        timeoutPromise
      ]);

      if (error) throw error;
      setPhone(formattedPhone); // Update state to correct format for verification
      setStep("otp");
    } catch (err: any) {
      if (err.message.includes("fetch") || err.message.includes("timed out")) {
        setError("Network error: Unable to connect to the server. Please check your internet connection.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Add a 10 second timeout
      const timeoutPromise = new Promise<{ error: Error }>((_, reject) => {
        setTimeout(() => reject(new Error("Connection to server timed out. Please check your internet or VPN.")), 10000);
      });

      const { error } = await Promise.race([
        supabase.auth.verifyOtp({
          phone: phone,
          token: otp,
          type: "sms",
        }),
        timeoutPromise
      ]);

      if (error) throw error;

      // Verification Successful
      setIsVerified(true);

      // Delay redirect to show success message
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      if (err.message.includes("fetch") || err.message.includes("timed out")) {
        setError("Network error: Unable to connect to the server. Please check your internet connection.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
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
      // Add a 10 second timeout
      const timeoutPromise = new Promise<{ error: Error }>((_, reject) => {
        setTimeout(() => reject(new Error("Connection to server timed out. Please check your internet or VPN.")), 10000);
      });

      const { error } = await Promise.race([
        supabase.auth.signInWithOtp({
          phone: phone,
        }),
        timeoutPromise
      ]);

      if (error) throw error;
      setTimer(60);
      setResendAttempts((prev) => prev + 1);
    } catch (err: any) {
      if (err.message.includes("fetch") || err.message.includes("timed out")) {
        setError("Network error: Unable to connect to the server. Please check your internet connection.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      setGoogleLoading(false);
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

              {/* Divider */}
              <div className={styles.divider}>
                <span>or</span>
              </div>

              {/* Google Login */}
              <button
                type="button"
                className={styles.btnGoogle}
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
