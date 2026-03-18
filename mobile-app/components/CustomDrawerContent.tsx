import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import {
  Users,
  LogOut,
  Sun,
  Moon,
  Settings,
  LayoutDashboard,
  Crown,
  ShieldCheck,
  Info,
} from "lucide-react-native";
import { useTheme } from "@/lib/ThemeContext";

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { theme, mode, setMode } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        if (profileData.avatar_url) {
          if (profileData.avatar_url.startsWith("http")) {
            setAvatarUrl(profileData.avatar_url);
          } else {
            const { data } = supabase.storage
              .from("profile-images")
              .getPublicUrl(profileData.avatar_url);
            setAvatarUrl(data.publicUrl);
          }
        }
      } else {
        // Fallback if no profile data found yet
        setProfile({
          full_name: user.user_metadata?.full_name || "User",
          email_id: user.email || "",
          mobile_number: user.phone,
        });
      }
    } catch (e) {
      console.error("Error fetching drawer profile:", e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const toggleTheme = () => {
    if (mode === "light") setMode("dark");
    else if (mode === "dark") setMode("system");
    else setMode("light");
  };

  const isDark = theme === "dark";
  const bgColor = isDark ? "#0f172a" : "#fff"; // Drawer usually looks better with solid bg in dark mode
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <View style={[styles.drawerContainer, { backgroundColor: bgColor }]}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header */}
          <View
            style={[styles.profileSection, { borderBottomColor: borderColor }]}
          >
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {profile?.full_name?.charAt(0) || "U"}
                </Text>
              )}
            </View>
            <View>
              <Text style={[styles.userName, { color: textColor }]}>
                {profile?.full_name || "User"}
              </Text>
              <Text style={[styles.userEmail, { color: subTextColor }]}>
                {profile?.email_id ||
                  profile?.mobile_number ||
                  "No Contact Info"}
              </Text>
            </View>
          </View>

          {/* Drawer Items */}
          <View style={styles.itemsContainer}>
            <DrawerItem
              label="Dashboard"
              labelStyle={{ color: textColor }}
              icon={({ color, size }) => (
                <LayoutDashboard
                  size={size}
                  color={theme === "dark" ? "#fff" : "#000"}
                />
              )}
              onPress={() => router.push("/(drawer)/(tabs)")}
            />

            <DrawerItem
              label="Plans"
              labelStyle={{ color: textColor }}
              icon={({ color, size }) => (
                <Users size={size} color={theme === "dark" ? "#fff" : "#000"} />
              )}
              onPress={() => router.push("/(drawer)/plans")}
            />
            <DrawerItem
              label="Membership"
              labelStyle={{ color: textColor }}
              icon={({ color, size }) => (
                <Crown size={size} color={theme === "dark" ? "#fff" : "#000"} />
              )}
              onPress={() => router.push("/(drawer)/membership")}
            />
            onPress={() => router.push("/(drawer)/settings")}
            />

            <View style={[styles.separator, { backgroundColor: borderColor }]} />

            <DrawerItem
              label="Privacy Policy"
              labelStyle={{ color: textColor }}
              icon={({ color, size }) => (
                <ShieldCheck size={size} color={theme === "dark" ? "#fff" : "#000"} />
              )}
              onPress={() => router.push("/(drawer)/privacy-policy")}
            />
            <DrawerItem
              label="About Us"
              labelStyle={{ color: textColor }}
              icon={({ color, size }) => (
                <Info size={size} color={theme === "dark" ? "#fff" : "#000"} />
              )}
              onPress={() => router.push("/(drawer)/about-us")}
            />
          </View>
        </DrawerContentScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: borderColor }]}>
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            {mode === "light" && <Sun size={24} color={textColor} />}
            {mode === "dark" && <Moon size={24} color={textColor} />}
            {mode === "system" && <Settings size={24} color={textColor} />}
            <Text style={[styles.footerText, { color: textColor }]}>
              Theme: {mode}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={24} color="#ef4444" />
            <Text style={[styles.footerText, { color: "#ef4444" }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
  },
  profileSection: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 14,
  },
  itemsContainer: {
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    gap: 15,
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 20,
  },
});
