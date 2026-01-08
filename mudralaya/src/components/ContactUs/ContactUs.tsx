"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./ContactUs.module.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    occupation: "",
    qualification: "",
    subject: "General Inquiry",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Invalid mobile number";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email";
    if (!formData.message.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("forms-api", {
        body: {
          action: "submit-contact-request",
          data: {
            ...formData,
            phoneNumber: `+91${formData.phoneNumber}`,
          },
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      });

      if (error) throw error;
      setSubmitStatus("success");
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        occupation: "",
        qualification: "",
        subject: "General Inquiry",
        message: "",
      });
    } catch (err) {
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>
            Contact <span className={styles.accent}>Us</span>
          </h1>
          <p className={styles.subtitle}>
            Any questions? Reach out and we&apos;ll get back to you soon.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.infoCol}>
            <div className={styles.infoContent}>
              <h2>Contact Information</h2>
              <p>Call us during office hours for immediate help.</p>

              <div className={styles.details}>
                <div className={styles.item}>
                  <Phone className={styles.icon} size={20} />
                  <span>+91 8899883638</span>
                </div>
                <div className={styles.item}>
                  <Mail className={styles.icon} size={20} />
                  <span>contact@mudralaya.com</span>
                </div>
                <div className={styles.item}>
                  <MapPin className={styles.icon} size={20} />
                  <span>Sikanderpur, WeWork, Gurugram</span>
                </div>
              </div>

              <div className={styles.illustration}>
                <img
                  src="/images/customer-support.png"
                  alt="Support"
                  className={styles.supportImg}
                />
              </div>
            </div>
          </div>

          <div className={styles.formCol}>
            {submitStatus === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.success}
              >
                <CheckCircle2 size={64} className={styles.successIcon} />
                <h3>Message Sent!</h3>
                <p>
                  Thank you for reaching out. A team member will contact you
                  shortly.
                </p>
                <button
                  onClick={() => setSubmitStatus("idle")}
                  className={styles.resetBtn}
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <div className={styles.field}>
                    <label>Full Name</label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className={errors.fullName ? styles.inputError : ""}
                    />
                    {errors.fullName && (
                      <span className={styles.errorText}>
                        {errors.fullName}
                      </span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label>Phone Number</label>
                    <input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={errors.phoneNumber ? styles.inputError : ""}
                    />
                    {errors.phoneNumber && (
                      <span className={styles.errorText}>
                        {errors.phoneNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <div className={styles.field}>
                    <label>Email</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className={errors.email ? styles.inputError : ""}
                    />
                    {errors.email && (
                      <span className={styles.errorText}>{errors.email}</span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label>Occupation</label>
                    <select
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      <option value="student">Student</option>
                      <option value="professional">Professional</option>
                      <option value="homemaker">Homemaker</option>
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="How can we help?"
                    className={errors.message ? styles.inputError : ""}
                  />
                  {errors.message && (
                    <span className={styles.errorText}>{errors.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className={styles.spinner} />
                  ) : (
                    <>
                      Submit <Send size={18} />
                    </>
                  )}
                </button>

                {submitStatus === "error" && (
                  <p className={styles.errorMsg}>
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
