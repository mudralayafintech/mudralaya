"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, CheckCircle2, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./Advisor.module.css";

const Advisor = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    emailId: "",
    dateOfBirth: "",
    profession: "",
    irdaLicense: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!/^[0-9]{10}$/.test(formData.mobileNumber))
      newErrors.mobileNumber = "10-digit mobile required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId))
      newErrors.emailId = "Invalid email";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "DOB is required";
    if (!formData.profession) newErrors.profession = "Select profession";
    if (!formData.irdaLicense) newErrors.irdaLicense = "Select license status";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("forms-api", {
        body: { action: "submit-advisor-application", data: formData },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.card}
      >
        <button onClick={() => router.push("/")} className={styles.closeBtn}>
          <X size={24} />
        </button>

        <div className={styles.grid}>
          <div className={styles.imageCol}>
            <div className={styles.logo}>
              <img src="/images/mudralya_logo.webp" alt="Mudralaya" />
              <span>Mudralaya Fintech</span>
            </div>
            <div className={styles.accentGlow} />
          </div>

          <div className={styles.formCol}>
            <h1 className={styles.title}>
              Become our <span className={styles.accent}>Advisor</span>
            </h1>
            <p className={styles.subtitle}>
              Fill in your details and we&apos;ll assist you in your
              professional journey.
            </p>

            {success ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={styles.success}
              >
                <div className={styles.successIcon}>
                  <CheckCircle2 size={48} />
                </div>
                <h2>Application Received!</h2>
                <p>
                  We&apos;ll review your details and get back to you shortly.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className={styles.backBtn}
                >
                  Back to Home
                </button>
              </motion.div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Enter your name"
                    className={errors.fullName ? styles.inputError : ""}
                  />
                  {errors.fullName && (
                    <span className={styles.errorText}>{errors.fullName}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <div className={styles.field}>
                    <label>Mobile Number</label>
                    <input
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobileNumber: e.target.value,
                        })
                      }
                      placeholder="10-digit number"
                      className={errors.mobileNumber ? styles.inputError : ""}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateOfBirth: e.target.value,
                        })
                      }
                      max={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() - 16)
                        )
                          .toISOString()
                          .split("T")[0]
                      }
                      className={errors.dateOfBirth ? styles.inputError : ""}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Email Address</label>
                  <input
                    name="emailId"
                    value={formData.emailId}
                    onChange={(e) =>
                      setFormData({ ...formData, emailId: e.target.value })
                    }
                    placeholder="email@example.com"
                    className={errors.emailId ? styles.inputError : ""}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <div className={styles.field}>
                    <label>Profession</label>
                    <select
                      value={formData.profession}
                      onChange={(e) =>
                        setFormData({ ...formData, profession: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      <option value="student">Student</option>
                      <option value="working">Professional</option>
                      <option value="housewife">Homemaker</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>IRDAI License?</label>
                    <select
                      value={formData.irdaLicense}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          irdaLicense: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className={styles.spinner} size={20} />
                  ) : (
                    <>
                      Submit Application <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Advisor;
