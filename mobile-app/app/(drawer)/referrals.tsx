import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Menu,
  Copy,
  Share2,
  Users,
  Gift,
  TrendingUp,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  Clock,
} from "lucide-react-native";
import {
  DrawerActions,
  useNavigation,
} from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { GlassView } from "@/components/GlassView";
import { Skeleton } from "@/components/Skeleton";
import * as Clipboard from "expo-clipboard";

interface ReferralStats {
  totalInvited: number;
  totalJoined: number;
  totalEarned: number;
  pendingRewards: number;
}

interface Referral {
  id: string;
  referred_name: string;
  referred_phone: string;
  status: "pending" | "joined" | "active";
  reward_earned: number;
  created_at: string;
}

export default function ReferralsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [stats, setStats] = useState<ReferralStats>({
    totalInvited: 0,
    totalJoined: 0,
    totalEarned: 0,
    pendingRewards: 0,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);

  const isDark = theme === "dark";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(255,255,255,0.5)";
  const iconColor = isDark ? "#fff" : "#1e293b";

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile for referral code
      const { data: profile } = await supabase
        .from("users")
        .select("referral_code, full_name")
        .eq("id", user.id)
        .single();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
      } else {
        // Generate a referral code if none exists
        const code = `MUD${user.id.slice(0, 6).toUpperCase()}`;
        setReferralCode(code);
        await supabase
          .from("users")
          .update({ referral_code: code })
          .eq("id", user.id);
      }

      // Fetch referral stats
      const { data: referralData } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (referralData) {
        setReferrals(
          referralData.map((r: any) => ({
            id: r.id,
            referred_name: r.referred_name || "Unknown",
            referred_phone: r.referred_phone || "",
            status: r.status || "pending",
            reward_earned: r.reward_earned || 0,
            created_at: r.created_at,
          }))
        );

        const joined = referralData.filter(
          (r: any) => r.status === "joined" || r.status === "active"
        ).length;
        const totalEarned = referralData.reduce(
          (sum: number, r: any) => sum + (r.reward_earned || 0),
          0
        );
        const pending = referralData.filter(
          (r: any) => r.status === "pending"
        ).length;

        setStats({
          totalInvited: referralData.length,
          totalJoined: joined,
          totalEarned: totalEarned,
          pendingRewards: pending,
        });
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      if (!refreshing) setLoading(false);
      setRefreshing(false);
      if (refreshing) setTimeout(() => setLoading(false), 500);
    }
  };

  const onRefresh = React.useCallback(() => {
    setLoading(true);
    setRefreshing(true);
    fetchReferralData();
  }, []);

  const handleCopyCode = async () => {
    if (Platform.OS !== "web") {
      await Clipboard.setStringAsync(referralCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Mudralaya and start earning! Use my referral code: ${referralCode}\n\nDownload now: https://mudralaya.com/app?ref=${referralCode}`,
        title: "Join Mudralaya",
      });
    } catch (error: any) {
      console.error("Share error:", error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "joined":
        return "#3b82f6";
      default:
        return "#f59e0b";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 size={16} color="#10b981" />;
      case "joined":
        return <UserPlus size={16} color="#3b82f6" />;
      default:
        return <Clock size={16} color="#f59e0b" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const ReferralSkeleton = () => (
    <View style={{ padding: 20, gap: 24 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Skeleton width={40} height={40} borderRadius={12} />
        <Skeleton width={120} height={32} borderRadius={16} />
      </View>
      <Skeleton width="100%" height={140} borderRadius={24} />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Skeleton width="48%" height={90} borderRadius={20} />
        <Skeleton width="48%" height={90} borderRadius={20} />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Skeleton width="48%" height={90} borderRadius={20} />
        <Skeleton width="48%" height={90} borderRadius={20} />
      </View>
      <Skeleton width={120} height={24} />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} width="100%" height={72} borderRadius={16} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Background */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={isDark ? ["#0f172a", "#1e1b4b"] : ["#faf5ff", "#f8fafc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.blob1, isDark && { opacity: 0.1 }]} />
        <View style={[styles.blob2, isDark && { opacity: 0.1 }]} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8b5cf6"
            />
          }
        >
          {loading ? (
            <ReferralSkeleton />
          ) : (
            <>
              {/* Header */}
              <View style={styles.headerTop}>
                <TouchableOpacity
                  style={[
                    styles.menuBtn,
                    isDark && { backgroundColor: "rgba(30,41,59,0.5)" },
                  ]}
                  onPress={() =>
                    navigation.dispatch(DrawerActions.toggleDrawer())
                  }
                >
                  <Menu size={24} color={iconColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: textColor }]}>
                  Referrals
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Referral Code Card */}
              <LinearGradient
                colors={["#7c3aed", "#a855f7", "#c084fc"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.referralCard}
              >
                <View style={styles.referralCardOverlay} />
                <View style={styles.referralCardContent}>
                  <Text style={styles.referralCardTitle}>
                    Your Referral Code
                  </Text>
                  <View style={styles.codeContainer}>
                    <Text style={styles.referralCodeText}>{referralCode}</Text>
                    <TouchableOpacity
                      style={styles.copyBtn}
                      onPress={handleCopyCode}
                    >
                      <Copy size={18} color="#7c3aed" />
                      <Text style={styles.copyBtnText}>
                        {copied ? "Copied!" : "Copy"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={handleShare}
                  >
                    <Share2 size={18} color="#fff" />
                    <Text style={styles.shareBtnText}>
                      Share & Earn ₹100 per referral
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                <GlassView
                  intensity={60}
                  style={[styles.statCard, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: "rgba(139, 92, 246, 0.1)" },
                    ]}
                  >
                    <Users size={20} color="#8b5cf6" />
                  </View>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {stats.totalInvited}
                  </Text>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>
                    Invited
                  </Text>
                </GlassView>

                <GlassView
                  intensity={60}
                  style={[styles.statCard, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                    ]}
                  >
                    <UserPlus size={20} color="#10b981" />
                  </View>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {stats.totalJoined}
                  </Text>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>
                    Joined
                  </Text>
                </GlassView>

                <GlassView
                  intensity={60}
                  style={[styles.statCard, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                    ]}
                  >
                    <TrendingUp size={20} color="#3b82f6" />
                  </View>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    ₹{stats.totalEarned}
                  </Text>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>
                    Earned
                  </Text>
                </GlassView>

                <GlassView
                  intensity={60}
                  style={[styles.statCard, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                    ]}
                  >
                    <Gift size={20} color="#f59e0b" />
                  </View>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    {stats.pendingRewards}
                  </Text>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>
                    Pending
                  </Text>
                </GlassView>
              </View>

              {/* Referral History */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Referral History
                </Text>
                {referrals.length > 0 ? (
                  referrals.map((ref) => (
                    <GlassView
                      key={ref.id}
                      intensity={50}
                      style={[styles.referralItem, { borderColor }]}
                      tint={isDark ? "dark" : "light"}
                    >
                      <View style={styles.referralItemLeft}>
                        <View
                          style={[
                            styles.referralAvatar,
                            {
                              backgroundColor:
                                getStatusColor(ref.status) + "20",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.referralAvatarText,
                              { color: getStatusColor(ref.status) },
                            ]}
                          >
                            {ref.referred_name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.referralName,
                              { color: textColor },
                            ]}
                          >
                            {ref.referred_name}
                          </Text>
                          <Text
                            style={[
                              styles.referralDate,
                              { color: subTextColor },
                            ]}
                          >
                            {formatDate(ref.created_at)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.referralItemRight}>
                        <View style={styles.statusBadge}>
                          {getStatusIcon(ref.status)}
                          <Text
                            style={[
                              styles.statusText,
                              { color: getStatusColor(ref.status) },
                            ]}
                          >
                            {ref.status.charAt(0).toUpperCase() +
                              ref.status.slice(1)}
                          </Text>
                        </View>
                        {ref.reward_earned > 0 && (
                          <Text style={styles.referralReward}>
                            +₹{ref.reward_earned}
                          </Text>
                        )}
                      </View>
                    </GlassView>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Users size={48} color={subTextColor} />
                    <Text
                      style={[styles.emptyTitle, { color: textColor }]}
                    >
                      No referrals yet
                    </Text>
                    <Text
                      style={[styles.emptyText, { color: subTextColor }]}
                    >
                      Share your referral code and earn ₹100 for every friend
                      who joins!
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDecoration: { ...StyleSheet.absoluteFillObject },
  blob1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
  },
  blob2: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  menuBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  referralCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: "hidden",
  },
  referralCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  referralCardContent: { padding: 24 },
  referralCardTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  referralCodeText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  copyBtnText: { color: "#7c3aed", fontWeight: "700", fontSize: 13 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  shareBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "47.5%",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 12, fontWeight: "600" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  referralItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  referralItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  referralAvatarText: { fontSize: 16, fontWeight: "700" },
  referralName: { fontSize: 15, fontWeight: "600" },
  referralDate: { fontSize: 12, marginTop: 2 },
  referralItemRight: { alignItems: "flex-end", gap: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  referralReward: { color: "#10b981", fontWeight: "700", fontSize: 14 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
