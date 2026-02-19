"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserPlus,
  Send,
  Loader2,
  CheckCircle,
  ArrowRight,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { useUI } from "@/context/UIContext";
import { supabase } from "@/lib/supabase";
import styles from "./JoinUsModal.module.css";

const JoinUsModal = () => {
  const { isJoinUsModalOpen, closeJoinUsModal, selectedPlan, modalData } =
    useUI();
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    emailId: "",
    dateOfBirth: "",
    profession: "",
    plan: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [finalPrice, setFinalPrice] = useState(2499);

  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponCode) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (couponCode.toUpperCase() === "MFONEYEAR") {
      setDiscountApplied(true);
      setFinalPrice(99); // Discounted price
    } else {
      setCouponError("Invalid Coupon Code");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setDiscountApplied(false);
    setCouponError("");
    setFinalPrice(2499);
  };

  // Calculate price based on passed data
  const isIndividualWithLaptop =
    modalData?.hasLaptop && selectedPlan === "individual";
  const individualPrice = isIndividualWithLaptop ? 5000 : 25000;

  useEffect(() => {
    if (isJoinUsModalOpen && selectedPlan) {
      setFormData((prev) => ({ ...prev, plan: selectedPlan }));
    }
  }, [isJoinUsModalOpen, selectedPlan]);

  // Price calculation helpers (removed useEffect script injection)

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setSubmitted(false);
    setShowUpsell(false);
    setShowPaymentScreen(false);
    setSubmitError("");
    setSubmissionId(null);
    setFormData({
      fullName: "",
      mobileNumber: "",
      emailId: "",
      dateOfBirth: "",
      profession: "",
      plan: "",
    });
    setCouponCode("");
    setDiscountApplied(false);
    setCouponError("");
    setFinalPrice(2499);
    closeJoinUsModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);

    try {
      // Append laptop info if applicable
      const submissionData = { ...formData };
      if (isIndividualWithLaptop) {
        // We can add this to the message or separate field if DB supports it.
        // For now, let's keep it simple or send in metadata if needed.
        // Or if 'profession' allows custom text.
      }

      const { data, error } = await supabase.functions.invoke("forms-api", {
        body: { action: "submit-join-request", data: submissionData },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });

      if (error) throw error;

      if (data?.id) {
        setSubmissionId(data.id);
      }

      // If plan is individual, show Payment Screen (25k or 5k)
      if (formData.plan === "individual") {
        setShowPaymentScreen(true);
      }
      // If plan is others (free, business, startup), show Upsell (99)
      else {
        setShowUpsell(true);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipUpsell = () => {
    setShowUpsell(false);
    setSubmitted(true);
  };

  // Helper to load Razorpay dynamically
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (amount: number, description: string) => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // 0. Load Razorpay Script
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Check your connection.");
      }

      // 1. Create Order
      const { data: orderData, error: orderError } =
        await supabase.functions.invoke("razorpay-api", {
          body: {
            action: "create-order",
            data: {
              amount: amount,
              currency: "INR",
              // Razorpay receipt max length is 40.
              receipt: submissionId ? `r_${submissionId}` : `r_${Date.now()}`,
            },
          },
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
        });

      if (orderError) throw orderError;

      // 2. Open Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Mudralaya Fintech Private Limited",
        description: description,
        image: "/images/mudralya_logo.webp", // Ensure logo is passed
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const { error: verifyError } = await supabase.functions.invoke(
              "razorpay-api",
              {
                body: {
                  action: "verify-payment",
                  data: {
                    ...response,
                    submissionId: submissionId,
                  },
                },
                headers: {
                  Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                },
              },
            );

            if (verifyError) throw verifyError;

            // Success
            setShowUpsell(false);
            setShowPaymentScreen(false);
            setSubmitted(true);
          } catch (err: any) {
            console.error("Payment Verification Failed", err);
            setSubmitError(
              "Payment verification failed. Please contact support.",
            );
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.emailId,
          contact: formData.mobileNumber,
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();

      rzp1.on("payment.failed", function (response: any) {
        setSubmitError(`Payment failed: ${response.error.description}`);
      });
    } catch (err: any) {
      console.error("Payment Init Failed", err);
      // Try to extract more info if available
      let errorMsg = err.message || "Failed to initiate payment.";
      if (err.context && err.context.json) {
        try {
          const json = await err.context.json();
          if (json.error) errorMsg = json.error;
        } catch (e) {
          /* ignore */
        }
      }
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isJoinUsModalOpen && (
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

            {showPaymentScreen ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={styles.upsellView}
              >
                <span className={styles.upsellBadge}>🚀 Individual Plan</span>
                <h2 className={styles.upsellTitle}>Complete Registration</h2>
                <span className={styles.upsellPrice}>
                  {formatPrice(individualPrice)}
                </span>
                <p className={styles.upsellDesc}>
                  {isIndividualWithLaptop
                    ? "Special laptop-owner pricing applied!"
                    : "Secure your spot in the Individual Membership Program."}
                </p>

                {submitError && (
                  <div
                    className={styles.error}
                    style={{ marginBottom: "1rem" }}
                  >
                    {submitError}
                  </div>
                )}

                <button
                  onClick={() =>
                    handlePayment(individualPrice, "Individual Plan Membership")
                  }
                  className={styles.payBtn}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Pay {formatPrice(individualPrice)}{" "}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </motion.div>
            ) : showUpsell ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={styles.upsellView}
              >
                <span className={styles.upsellBadge}>
                  ✨ Special One-Time Offer
                </span>
                <h2 className={styles.upsellTitle}>Become an Early Member</h2>
                <span className={styles.upsellPrice}>
                  {formatPrice(finalPrice)}
                </span>
                <p className={styles.upsellDesc}>
                  Unlock premium task benefits instantly!
                </p>

                {/* Coupon Section */}
                <div
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={discountApplied}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                      }}
                    />
                    {discountApplied ? (
                      <button
                        onClick={handleRemoveCoupon}
                        style={{
                          padding: "10px 16px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#fee2e2",
                          color: "#ef4444",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        style={{
                          padding: "10px 16px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#2563eb",
                          color: "white",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <span style={{ color: "#ef4444", fontSize: "13px" }}>
                      {couponError}
                    </span>
                  )}
                  {discountApplied && (
                    <span
                      style={{
                        color: "#059669",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      Coupon Applied! Price reduced to ₹99.
                    </span>
                  )}
                </div>

                <div className={styles.upsellBenefits}>
                  <div className={styles.upsellItem}>
                    <CheckCircle size={18} className={styles.checkIcon} />
                    <span>Priority Task Allocation</span>
                  </div>
                  <div className={styles.upsellItem}>
                    <CheckCircle size={18} className={styles.checkIcon} />
                    <span>Verified Member Badge</span>
                  </div>
                  <div className={styles.upsellItem}>
                    <CheckCircle size={18} className={styles.checkIcon} />
                    <span>Access to High-Value Surveys</span>
                  </div>
                </div>

                {submitError && (
                  <div
                    className={styles.error}
                    style={{ marginBottom: "1rem" }}
                  >
                    {submitError}
                  </div>
                )}

                <button
                  onClick={() =>
                    handlePayment(finalPrice, "Early Member Subscription")
                  }
                  className={styles.payBtn}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Get for {formatPrice(finalPrice)} <ArrowRight size={20} />
                    </>
                  )}
                </button>
                <button
                  onClick={handleSkipUpsell}
                  className={styles.skipBtn}
                  disabled={submitting}
                >
                  Skip for now
                </button>
              </motion.div>
            ) : submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.successView}
              >
                <div className={styles.successIcon}>
                  <CheckCircle size={48} />
                </div>
                <h2>Submission Received!</h2>
                <p>
                  Thank you for your interest in Mudralaya. Our team will review
                  your application and get back to you soon.
                </p>
                <button onClick={handleClose} className={styles.primaryBtn}>
                  Close
                </button>
              </motion.div>
            ) : (
              <>
                <div className={styles.header}>
                  <div className={styles.iconWrapper}>
                    <UserPlus size={24} />
                  </div>
                  <h2>Become our Partner</h2>
                  <p>
                    Join Mudralaya and start earning by completing simple tasks
                    anytime, anywhere!
                  </p>
                </div>

                <div className={styles.body}>
                  {submitError && (
                    <div className={styles.error}>{submitError}</div>
                  )}

                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.grid}>
                      <div className={styles.inputGroup}>
                        <label>Full Name*</label>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>Mobile Number*</label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          placeholder="10 digit number"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          required
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>Email Id</label>
                        <input
                          type="email"
                          name="emailId"
                          placeholder="john@example.com"
                          value={formData.emailId}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>Date of Birth*</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          max={
                            new Date(
                              new Date().setFullYear(
                                new Date().getFullYear() - 16,
                              ),
                            )
                              .toISOString()
                              .split("T")[0]
                          }
                          required
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>Profession*</label>
                        <select
                          name="profession"
                          value={formData.profession}
                          onChange={handleChange}
                          required
                          className={styles.select}
                        >
                          <option value="">Select profession</option>
                          <option value="student">Student</option>
                          <option value="working-professional">
                            Working Professional
                          </option>
                          <option value="house-wife">House Wife</option>
                          <option value="business-man">Business Man</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className={styles.inputGroup}>
                        <label>Plan*</label>
                        <select
                          name="plan"
                          value={formData.plan}
                          onChange={handleChange}
                          required
                          className={styles.select}
                        >
                          <option value="">Select plan</option>
                          <option value="free">Free</option>
                          <option value="individual">Individual</option>
                          <option value="business-solution">
                            Business Solution
                          </option>
                          <option value="startup-launch-lab">
                            Startup Launch Lab
                          </option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          Submit Form <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JoinUsModal;
