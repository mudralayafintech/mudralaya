import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Stack, useRouter, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Bell,
  FileText,
  HelpCircle,
  ChevronRight,
  Menu,
  Camera,
  Crown,
  Sparkles,
  ArrowRight,
  Check,
  X,
  Moon,
  Sun,
  Monitor,
  Palette,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { DrawerActions } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import { supabase } from "../../lib/supabase";
import { GlassView } from "../../components/GlassView";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../lib/ThemeContext";
import { Skeleton } from "../../components/Skeleton";
import { BlurView } from "expo-blur";

export default function Settings() {
  const router = useRouter(); // Initialize router
  const navigation = useNavigation(); // Initialize navigation
  const [activeTab, setActiveTab] = useState("account");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme, mode, setMode } = useTheme();

  // Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [taskUpdates, setTaskUpdates] = useState(true);
  const [promoOffers, setPromoOffers] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState("");
  const [dob, setDob] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchNotifications()]);
    setRefreshing(false);
    setTimeout(() => setLoading(false), 500);
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile({ ...data, email: user.email, phone: user.phone });
        setFullName(data?.full_name || "");
        setProfession(data?.profession || "");
        setDob(data?.date_of_birth || "");
        setAvatarUrl(data?.avatar_url || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      if (!refreshing) setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setNotificationLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setNotifications([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Error picking image");
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user logged in");

      console.log("Reading file from:", uri);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const fileExt = uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
    } catch (error: any) {
      Alert.alert("Error", "Error uploading image: " + error.message);
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user logged in");

      const updates = {
        full_name: fullName,
        profession: profession,
        date_of_birth: dob || null,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    const parseISTDate = (istStr: string) => {
      if (!istStr) return null;
      const match = istStr.match(
        /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/,
      );
      if (!match) return null;
      const [_, d, m, y, h, min, s] = match;
      return new Date(
        Number(y),
        Number(m) - 1,
        Number(d),
        Number(h),
        Number(min),
        Number(s),
      );
    };

    const queuedPlanInfo = (() => {
      if (!profile?.membership_start_date) return null;
      const startDate = parseISTDate(profile.membership_start_date);
      if (!startDate) return null;

      const now = new Date();
      if (startDate > now) {
        const diffMs = startDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return {
          days: diffDays,
          type: profile.membership_type,
        };
      }
      return null;
    })();

    switch (activeTab) {
      case "account":
        return (
          <View style={styles.sectionContainer}>
            {profile?.membership_type && (
              <View style={styles.membershipCardWrapper}>
                <LinearGradient
                  colors={["#FFD700", "#DAA520", "#B8860B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.membershipCard}
                >
                  <View style={styles.cardHeader}>
                    <Crown color="#fff" size={20} />
                    <Text style={styles.membershipTitle}>
                      {profile.membership_type.toUpperCase()} MEMBERSHIP
                    </Text>
                  </View>

                  <View style={styles.cardDetails}>
                    <View>
                      <Text style={styles.cardLabel}>Member Since</Text>
                      <Text style={styles.cardValue}>
                        {profile.membership_start_date?.split(",")[0] ||
                          "DD/MM/YYYY"}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.cardLabel}>Expiry Date</Text>
                      <Text style={styles.cardValue}>
                        {profile.membership_expiry?.includes(",")
                          ? profile.membership_expiry.split(",")[0]
                          : profile.membership_expiry?.split("T")[0] || "MM/YY"}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {queuedPlanInfo && (
                  <View style={styles.stackedBadge}>
                    <Sparkles size={14} color="#DAA520" />
                    <Text style={styles.stackedText}>
                      Next {queuedPlanInfo.type} plan starts in{" "}
                      {queuedPlanInfo.days} days
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Account Settings
            </Text>

            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <User size={40} color="#999" />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.editBadge}
                  onPress={pickImage}
                  disabled={uploading}
                >
                  <Camera size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.avatarHelperText}>
                {uploading ? "Uploading..." : "Tap camera to change photo"}
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: labelColor }]}>
                Full Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                ]}
                placeholder="Your Name"
                placeholderTextColor={subTextColor}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: labelColor }]}>
                Email Address
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                ]}
                placeholder="email@example.com"
                placeholderTextColor={subTextColor}
                value={profile?.email_id || profile?.email}
                editable={false} // Email typically read-only or requires verify flow
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: labelColor }]}>
                Phone Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.disabledInput,
                  {
                    backgroundColor: isDark ? "#334155" : "#f1f5f9",
                    color: subTextColor,
                    borderColor,
                  },
                ]}
                placeholder="Phone Number"
                value={profile?.mobile_number || profile?.phone}
                editable={false}
              />
              <Text style={styles.helperText}>
                Phone number cannot be changed here.
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: labelColor }]}>
                Date of Birth
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={subTextColor}
                value={dob}
                onChangeText={setDob}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: labelColor }]}>
                Profession
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                ]}
                placeholder="e.g. Developer, Designer"
                placeholderTextColor={subTextColor}
                value={profession}
                onChangeText={setProfession}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "notifications":
        return (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Notifications
            </Text>

            <View style={[styles.toggleRow, { backgroundColor: cardBg }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: textColor }]}>
                  Email Notifications
                </Text>
                <Text style={[styles.toggleDesc, { color: subTextColor }]}>
                  Receive emails about your account activity.
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: "#e5e7eb", true: "#4F46E5" }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.toggleRow, { backgroundColor: cardBg }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: textColor }]}>
                  Task Updates
                </Text>
                <Text style={[styles.toggleDesc, { color: subTextColor }]}>
                  Get notified when a task is approved.
                </Text>
              </View>
              <Switch
                value={taskUpdates}
                onValueChange={setTaskUpdates}
                trackColor={{ false: "#e5e7eb", true: "#4F46E5" }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.toggleRow, { backgroundColor: cardBg }]}>
              <View style={styles.toggleInfo}>
                <Text style={[styles.toggleLabel, { color: textColor }]}>
                  Promotional Offers
                </Text>
                <Text style={[styles.toggleDesc, { color: subTextColor }]}>
                  Receive updates about new plans and offers.
                </Text>
              </View>
              <Switch
                value={promoOffers}
                onValueChange={setPromoOffers}
                trackColor={{ false: "#e5e7eb", true: "#4F46E5" }}
                thumbColor="#fff"
              />
            </View>

            {/* Notification List (V1.1) */}
            <View style={styles.notificationHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Inbox
              </Text>
              {notifications.some((n) => !n.is_read) && (
                <TouchableOpacity onPress={markAllRead}>
                  <Text style={styles.clearBtnText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
            </View>

            {notificationLoading ? (
              <ActivityIndicator
                size="small"
                color="#4F46E5"
                style={{ marginTop: 20 }}
              />
            ) : notifications.length > 0 ? (
              <View style={styles.notificationList}>
                {notifications.map((notif) => (
                  <TouchableOpacity
                    key={notif.id}
                    style={[
                      styles.notificationItem,
                      !notif.is_read && styles.unreadItem,
                      { backgroundColor: cardBg, borderColor: borderColor },
                    ]}
                    onPress={() => !notif.is_read && markAsRead(notif.id)}
                  >
                    <View
                      style={[
                        styles.notifIconBg,
                        notif.type === "success" && styles.bgSuccess,
                        notif.type === "warning" && styles.bgWarning,
                        notif.type === "error" && styles.bgError,
                      ]}
                    >
                      {notif.type === "success" ? (
                        <Check size={16} color="#fff" />
                      ) : notif.type === "warning" ? (
                        <HelpCircle size={16} color="#fff" />
                      ) : notif.type === "error" ? (
                        <X size={16} color="#fff" />
                      ) : (
                        <Bell size={16} color="#fff" />
                      )}
                    </View>
                    <View style={styles.notifContent}>
                      <Text
                        style={[
                          styles.notifTitle,
                          !notif.is_read && styles.unreadTitle,
                          { color: textColor },
                        ]}
                      >
                        {notif.title}
                      </Text>
                      <Text
                        style={[styles.notifMessage, { color: subTextColor }]}
                      >
                        {notif.message}
                      </Text>
                      <Text style={[styles.notifTime, { color: subTextColor }]}>
                        {new Date(notif.created_at).toLocaleDateString([], {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    {!notif.is_read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.clearAllBtn}
                  onPress={clearAllNotifications}
                >
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyNotifContainer}>
                <Text style={[styles.emptyNotifText, { color: textColor }]}>
                  No new notifications
                </Text>
              </View>
            )}
          </View>
        );

      case "appearance":
        return (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Appearance
            </Text>
            <Text style={[styles.toggleDesc, { marginBottom: 20 }]}>
              Customize how Mudralaya looks on your device.
            </Text>

            <View style={styles.themeGrid}>
              {[
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
                { id: "system", label: "System", icon: Monitor },
              ].map((item: any) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.themeOption,
                    mode === item.id && [
                      styles.activeThemeOption,
                      { borderColor: "#4F46E5" },
                    ],
                    { backgroundColor: theme === "dark" ? "#1e293b" : "#fff" },
                  ]}
                  onPress={() => setMode(item.id)}
                >
                  <View
                    style={[
                      styles.themeIconBg,
                      {
                        backgroundColor:
                          mode === item.id
                            ? "#4F46E5"
                            : theme === "dark"
                              ? "#334155"
                              : "#f1f5f9",
                      },
                    ]}
                  >
                    <item.icon
                      size={24}
                      color={
                        mode === item.id
                          ? "#fff"
                          : theme === "dark"
                            ? "#94a3b8"
                            : "#64748b"
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: theme === "dark" ? "#fff" : "#333" },
                      mode === item.id && {
                        color: "#4F46E5",
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {mode === item.id && (
                    <View
                      style={[styles.activeDot, { backgroundColor: "#4F46E5" }]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return <View />;
    }
  };

  const isDark = theme === "dark";
  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.8)";
  const inputBg = isDark ? "#1e293b" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";
  const labelColor = isDark ? "#cbd5e1" : "#475569"; // Lighter color for dark mode labels

  const SettingsSkeleton = () => (
    <View style={{ padding: 20 }}>
      {/* Tabs Skeleton */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
        <Skeleton width={100} height={40} borderRadius={20} />
        <Skeleton width={120} height={40} borderRadius={20} />
        <Skeleton width={110} height={40} borderRadius={20} />
      </View>

      {/* Membership Card Skeleton */}
      <Skeleton
        width="100%"
        height={180}
        borderRadius={24}
        style={{ marginBottom: 24 }}
      />

      {/* Section Title */}
      <Skeleton width={150} height={24} style={{ marginBottom: 20 }} />

      {/* Avatar */}
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Skeleton
          width={100}
          height={100}
          borderRadius={50}
          style={{ marginBottom: 12 }}
        />
        <Skeleton width={180} height={16} />
      </View>

      {/* Form Fields */}
      <View style={{ gap: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i}>
            <Skeleton width={100} height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={50} borderRadius={12} />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.stickyHeader,
            {
              backgroundColor: isDark ? "#0f172a" : "#fff",
              borderBottomColor: borderColor,
            },
          ]}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={handleOpenDrawer}
              style={[
                styles.backButton,
                { backgroundColor: isDark ? "#1e293b" : "rgba(0,0,0,0.05)" },
              ]}
            >
              <Menu size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              Profile & Settings
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* SidebarTabs */}
          <View style={{ height: 60 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}
              contentContainerStyle={styles.tabsContent}
            >
              {[
                { id: "account", label: "Account", icon: User },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "appearance", label: "Appearance", icon: Palette },
              ].map((tab: any) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && [
                      styles.activeTab,
                      { backgroundColor: "#4F46E5" },
                    ],
                    {
                      backgroundColor: isDark
                        ? "rgba(30, 41, 59, 0.5)"
                        : "#f1f5f9",
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                    },
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <tab.icon
                    size={18}
                    color={
                      activeTab === tab.id
                        ? "#fff"
                        : isDark
                          ? "#94a3b8"
                          : textColor
                    }
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab.id && styles.activeTabText,
                      { color: activeTab === tab.id ? "#fff" : textColor },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4F46E5"
              />
            }
          >
            {loading ? <SettingsSkeleton /> : renderContent()}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    zIndex: 10,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
    paddingBottom: 0,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  contentContainer: {
    flex: 1,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: "#fff",
  },
  activeTab: {
    backgroundColor: "#333",
    borderColor: "#333",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  sectionContainer: {
    borderRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    color: "#333",
  },
  disabledInput: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: "#111",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },
  toggleInfo: {
    flex: 1,
    paddingRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 12,
    color: "#666",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#111",
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarHelperText: {
    fontSize: 12,
    color: "#999",
  },
  membershipCardWrapper: {
    marginBottom: 30,
    marginTop: 10,
  },
  membershipCard: {
    borderRadius: 20,
    padding: 20,
    height: 140,
    justifyContent: "space-between",
    shadowColor: "#DAA520",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  membershipTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  cardValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  stackedBadge: {
    position: "absolute",
    bottom: -15,
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#DAA520",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stackedText: {
    color: "#B8860B",
    fontSize: 11,
    fontWeight: "700",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 15,
  },
  clearBtnText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "600",
  },
  notificationList: {
    gap: 12,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    gap: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  unreadItem: {
    backgroundColor: "rgba(79, 70, 229, 0.03)",
    borderColor: "rgba(79, 70, 229, 0.1)",
  },
  notifIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#94a3b8",
    justifyContent: "center",
    alignItems: "center",
  },
  bgSuccess: { backgroundColor: "#10b981" },
  bgWarning: { backgroundColor: "#f59e0b" },
  bgError: { backgroundColor: "#ef4444" },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  unreadTitle: {
    color: "#111",
  },
  notifMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    color: "#999",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4F46E5",
  },
  clearAllBtn: {
    marginTop: 20,
    alignItems: "center",
    padding: 12,
  },
  clearAllText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyNotifContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyNotifText: {
    color: "#999",
    fontSize: 14,
  },
  themeGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  themeOption: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  activeThemeOption: {
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  themeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  activeDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
