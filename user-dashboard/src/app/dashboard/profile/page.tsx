"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  User,
  Phone,
  Mail,
  Camera,
  Save,
  X,
  Edit2,
  Briefcase,
  Loader2,
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";
import styles from "./profile.module.css";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    profession: "",
    email_id: "",
    date_of_birth: "",
    phone: "",
  });

  // OTP State for Phone Update
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          profession: profileData.profession || "",
          email_id: profileData.email_id || "",
          date_of_birth: profileData.date_of_birth || "",
          phone: user.phone || profileData.mobile_number || "",
        });
      }
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setMessage({ type: "", text: "" });
    setOtpSent(false);
    setOtp("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      setMessage({ type: "success", text: "Profile image updated!" });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setMessage({
        type: "error",
        text: `Error uploading image: ${error.message || "Unknown error"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setMessage({ type: "", text: "" });

    const currentPhone = user?.phone?.replace("+", "") || "";
    const newPhone = formData.phone?.replace("+", "") || "";

    if (newPhone && newPhone !== currentPhone) {
      try {
        const formattedPhone =
          newPhone.startsWith("91") || newPhone.startsWith("+91")
            ? newPhone.startsWith("+")
              ? newPhone
              : `+${newPhone}`
            : `+91${newPhone}`;

        const { error } = await supabase.auth.updateUser({
          phone: formattedPhone,
        });
        if (error) throw error;

        setOtpSent(true);
        setMessage({
          type: "info",
          text: "OTP sent to new phone number. Please verify.",
        });
        return;
      } catch (err: any) {
        setMessage({ type: "error", text: err.message });
        return;
      }
    }

    await updateProfileData();
  };

  const verifyPhoneOtp = async () => {
    setVerifyingOtp(true);
    try {
      const newPhone = formData.phone?.replace("+", "") || "";
      const formattedPhone =
        newPhone.startsWith("91") || newPhone.startsWith("+91")
          ? newPhone.startsWith("+")
            ? newPhone
            : `+${newPhone}`
          : `+91${newPhone}`;

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: "phone_change",
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Phone number updated successfully!",
      });
      setOtpSent(false);
      await updateProfileData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const updateProfileData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name,
          profession: formData.profession,
          email_id: formData.email_id,
          date_of_birth: formData.date_of_birth,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile((prev: any) => ({
        ...prev,
        ...data,
      }));

      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error updating profile" });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile)
    return (
      <div className={styles.profileLoading} style={{ display: "block" }}>
        <div className={styles.profileWrapper}>
          <div className={styles.glassCard}>
            <div className={styles.profileContentLayout}>
              {/* Left Column Skeleton */}
              <div className={styles.profileHeader}>
                <div className={styles.avatarContainer}>
                  <Skeleton width={120} height={120} borderRadius="50%" />
                </div>
                <Skeleton
                  width={150}
                  height={28}
                  style={{ marginTop: 16, marginBottom: 8 }}
                />
                <Skeleton
                  width={100}
                  height={20}
                  style={{ marginBottom: 24 }}
                />
                <Skeleton width={140} height={40} borderRadius={12} />
              </div>

              {/* Right Column Skeleton */}
              <div className={styles.profileDetails}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.detailItem}>
                    <Skeleton
                      width={40}
                      height={40}
                      borderRadius={12}
                      style={{ marginRight: 16 }}
                    />
                    <div style={{ flex: 1 }}>
                      <Skeleton
                        width={80}
                        height={16}
                        style={{ marginBottom: 8 }}
                      />
                      <Skeleton width="100%" height={24} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.glassCard}>
        {message.text && (
          <div
            className={`${styles.messageBanner} ${
              styles[message.type as keyof typeof styles]
            }`}
          >
            {message.text}
          </div>
        )}

        <div className={styles.profileContentLayout}>
          {/* Left Column: Avatar & Actions */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarContainer}>
              <img
                src={profile?.avatar_url || "https://placehold.co/150"}
                alt="Profile"
                className={styles.profileAvatar}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/150";
                }}
              />
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    accept="image/*"
                  />
                  <button
                    className={styles.editAvatarBtn}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={20} />
                  </button>
                </>
              )}
            </div>

            {!isEditing ? (
              <>
                <h2>{profile?.full_name || "User"}</h2>
                <p className={styles.profileRole}>
                  {profile?.role || "Member"}
                </p>
              </>
            ) : (
              <h2 className={styles.editModeTitle}>Editing Profile</h2>
            )}

            <div className={styles.profileActions}>
              {isEditing ? (
                <div className={styles.editActions}>
                  <button
                    className={styles.btnSave}
                    onClick={handleSave}
                    disabled={otpSent}
                  >
                    <Save size={18} /> Save
                  </button>
                  <button
                    className={styles.btnCancel}
                    onClick={handleEditToggle}
                  >
                    <X size={18} /> Cancel
                  </button>
                </div>
              ) : (
                <button
                  className={styles.btnEditProfile}
                  onClick={handleEditToggle}
                >
                  <Edit2 size={18} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Form Inputs */}
          <div className={styles.profileDetails}>
            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <User size={24} />
              </div>
              <div className={styles.detailContent}>
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Enter Full Name"
                  />
                ) : (
                  <p>{profile?.full_name || "Not set"}</p>
                )}
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <Phone size={24} />
              </div>
              <div className={styles.detailContent}>
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Enter Phone Number"
                  />
                ) : (
                  <p>{user?.phone || profile?.mobile_number || "N/A"}</p>
                )}
              </div>
            </div>

            {otpSent && isEditing && (
              <div className={styles.otpVerificationBlock}>
                <input
                  type="text"
                  placeholder="Enter OTP sent to new number"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className={`${styles.editInput} ${styles.otpInput}`}
                />
                <button
                  onClick={verifyPhoneOtp}
                  disabled={verifyingOtp}
                  className={styles.verifyBtn}
                >
                  {verifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <Mail size={24} />
              </div>
              <div className={styles.detailContent}>
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email_id"
                    value={formData.email_id}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Enter Email"
                  />
                ) : (
                  <p>{profile?.email_id || "No email"}</p>
                )}
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <Edit2 size={24} />
              </div>
              <div className={styles.detailContent}>
                <label>Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className={styles.editInput}
                  />
                ) : (
                  <p>{profile?.date_of_birth || "Not set"}</p>
                )}
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailIcon}>
                <Briefcase size={24} />
              </div>
              <div className={styles.detailContent}>
                <label>Profession</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                    className={styles.editInput}
                    placeholder="Enter Profession"
                  />
                ) : (
                  <p>{profile?.profession || "Not set"}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
