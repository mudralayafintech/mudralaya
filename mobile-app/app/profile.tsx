import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { GlassView } from "@/components/GlassView";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Camera,
  Edit2,
  Save,
  X,
  LogOut,
} from "lucide-react-native";
import { useTheme } from "@/lib/ThemeContext";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { theme } = useTheme();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    profession: "",
    email_id: "",
    date_of_birth: "",
    phone: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      }

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          profession: profileData.profession || "",
          email_id: profileData.email_id || "",
          date_of_birth: profileData.date_of_birth || "",
          phone: user.phone || profileData.mobile_number || "",
        });

        // Get public URL for avatar
        if (profileData.avatar_url) {
          // If it's a full URL, use it, otherwise construct it
          if (profileData.avatar_url.startsWith("http")) {
            setAvatarUrl(profileData.avatar_url);
          } else {
            // Assuming it's a path in profile-images bucket
            const { data } = supabase.storage
              .from("profile-images")
              .getPublicUrl(profileData.avatar_url);
            setAvatarUrl(data.publicUrl);
          }
        }
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const updates = {
        id: user.id,
        full_name: formData.full_name,
        profession: formData.profession,
        email_id: formData.email_id,
        date_of_birth: formData.date_of_birth,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("users").upsert(updates);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = asset.uri.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Decode base64
      // Note: Supabase upload expects Blob or File. In RN, we can use ArrayBuffer or FormData.
      const arrayBuffer = decode(asset.base64!);

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, arrayBuffer, {
          contentType: asset.mimeType || "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Update user profile with avatar path or URL
      const { data: publicUrlData } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      const updates = {
        id: user.id,
        avatar_url: publicUrlData.publicUrl,
        updated_at: new Date(),
      };

      const { error: updateError } = await supabase
        .from("users")
        .upsert(updates);
      if (updateError) throw updateError;

      setAvatarUrl(publicUrlData.publicUrl);
      Alert.alert("Success", "Profile picture updated!");
    } catch (error: any) {
      Alert.alert("Error", "Error uploading image: " + error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to decode base64 to ArrayBuffer
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /* Theme colors */
  const isDark = theme === "dark";
  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#fff";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: bgColor }]}
      style={{ backgroundColor: bgColor }}
    >
      <View
        style={[
          styles.content,
          { backgroundColor: cardBg, borderColor: borderColor, borderWidth: 1 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {profile?.full_name?.charAt(0) || "U"}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: textColor }]}>
            {profile?.full_name || "User Name"}
          </Text>
          <Text style={[styles.role, { color: subTextColor }]}>
            {profile?.profession || "Member"}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Personal Details
            </Text>
            {!isEditing ? (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.editBtn}
              >
                <Edit2 size={18} color="#3b82f6" />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={styles.cancelBtn}
                >
                  <X size={18} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUpdate}
                  style={styles.saveBtn}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Save size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <User size={16} color={subTextColor} />
              <Text style={[styles.label, { color: subTextColor }]}>
                Full Name
              </Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, backgroundColor: inputBg },
                ]}
                value={formData.full_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, full_name: text })
                }
              />
            ) : (
              <Text style={[styles.value, { color: textColor }]}>
                {formData.full_name || "Not set"}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Briefcase size={16} color={subTextColor} />
              <Text style={[styles.label, { color: subTextColor }]}>
                Profession
              </Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, backgroundColor: inputBg },
                ]}
                value={formData.profession}
                onChangeText={(text) =>
                  setFormData({ ...formData, profession: text })
                }
              />
            ) : (
              <Text style={[styles.value, { color: textColor }]}>
                {formData.profession || "Not set"}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Mail size={16} color={subTextColor} />
              <Text style={[styles.label, { color: subTextColor }]}>Email</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, backgroundColor: inputBg },
                ]}
                value={formData.email_id}
                onChangeText={(text) =>
                  setFormData({ ...formData, email_id: text })
                }
                autoCapitalize="none"
                keyboardType="email-address"
              />
            ) : (
              <Text style={[styles.value, { color: textColor }]}>
                {formData.email_id || "Not set"}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Calendar size={16} color={subTextColor} />
              <Text style={[styles.label, { color: subTextColor }]}>
                Date of Birth
              </Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[
                  styles.input,
                  { color: textColor, backgroundColor: inputBg },
                ]}
                value={formData.date_of_birth}
                onChangeText={(text) =>
                  setFormData({ ...formData, date_of_birth: text })
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={subTextColor}
              />
            ) : (
              <Text style={[styles.value, { color: textColor }]}>
                {formData.date_of_birth || "Not set"}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Phone size={16} color={subTextColor} />
              <Text style={[styles.label, { color: subTextColor }]}>Phone</Text>
            </View>
            <View style={styles.phoneRow}>
              <Text style={[styles.value, { color: textColor, flex: 1 }]}>
                {formData.phone || "Not set"}
              </Text>
              {/* Phone update usually requires separate flow with OTP, simplified for now */}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => supabase.auth.signOut()}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Polyfill for atob if needed, or use buffer package.
// For simplicity in this snippet, a basic base64 decoder could be imported or this hack used if environment supports it.
// React Native usually needs 'base-64' package.
// We will replace `atob` with `Buffer` if available or `base-64`.
// For now, let's assume `global.atob` might not exist.
import { decode as atob } from "base-64";
if (!global.atob) {
  global.atob = atob;
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    minHeight: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "bold",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3b82f6",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
  },
  form: {
    gap: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  editBtnText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#3b82f6",
    padding: 5,
    borderRadius: 5,
  },
  cancelBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 5,
    borderRadius: 5,
  },
  field: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    paddingVertical: 8,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderRadius: 12,
  },
  phoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutBtn: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 15,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 16,
  },
});
