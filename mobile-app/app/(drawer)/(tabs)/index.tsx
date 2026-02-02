import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import {
  Play,
  TrendingUp,
  Wallet,
  HandCoins,
  Users,
  Rocket,
  MessageSquare,
  Copy,
  Menu,
  Bell,
  ChevronRight,
  CheckCircle2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import VideoModal from "@/components/VideoModal";
import { GlassView } from "@/components/GlassView";
import { StatusBar } from "expo-status-bar";

interface Task {
  id: string;
  title: string;
  category: string;
  icon_type: string;
  action_link?: string;
  reward_member?: number;
  reward_free?: number;
  reward_info?: string;
}

interface DashboardData {
  tasks: Task[];
  ongoingTask: Task | null;
  stats: {
    approved: number;
    pending: number;
    total: number;
    today: number;
    monthly: number;
  };
}

import { useTheme } from "@/lib/ThemeContext";

const { width } = Dimensions.get("window");

export default function DashboardHome() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [data, setData] = useState<DashboardData>({
    tasks: [],
    ongoingTask: null,
    stats: { approved: 0, pending: 0, total: 0, today: 0, monthly: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [joiningTaskId, setJoiningTaskId] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileData) setProfile(profileData);

      // Fetch Dashboard Data
      const [tasksRes, statsRes, userTasksRes] = await Promise.all([
        supabase.from("tasks").select("*").limit(5),
        supabase.rpc("get_user_wallet_stats", { user_id_param: user.id }),
        supabase
          .from("user_tasks")
          .select("*, tasks(*)")
          .eq("user_id", user.id)
          .eq("status", "ongoing")
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      const tasks = tasksRes.data || [];
      const stats = statsRes.data || {
        approved: 0,
        pending: 0,
        total: 0,
        today: 0,
        monthly: 0,
      };
      const ongoingTask =
        userTasksRes.data && userTasksRes.data.length > 0
          ? userTasksRes.data[0].tasks
          : null;

      setData({
        tasks,
        ongoingTask,
        stats: stats as any,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const handleStartTask = async (task: Task) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setJoiningTaskId(task.id);
    try {
      const { error } = await supabase.functions.invoke("dashboard-api", {
        body: { action: "start-task", taskId: task.id },
      });

      if (error) throw error;
      await fetchDashboardData();
    } catch (err: any) {
      console.error("Failed to start task:", err);
    } finally {
      setJoiningTaskId(null);
    }
  };

  const getIcon = (type: string, color = "#fff", size = 20) => {
    switch (type) {
      case "group":
        return <Users size={size} color={color} />;
      case "rocket":
        return <Rocket size={size} color={color} />;
      case "feedback":
        return <MessageSquare size={size} color={color} />;
      default:
        return <Copy size={size} color={color} />;
    }
  };

  const isDark = theme === "dark";
  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "rgba(30, 41, 59, 0.6)" : "#fff";
  const borderColor = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(255, 255, 255, 0.5)";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Background decoration for Glassmorphism */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={isDark ? ["#0f172a", "#1e293b"] : ["#e0e7ff", "#f8fafc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.blob1, isDark && { opacity: 0.1 }]} />
        <View style={[styles.blob2, isDark && { opacity: 0.1 }]} />
        <View style={[styles.blob3, isDark && { opacity: 0.1 }]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4f46e5"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
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
                <Menu size={24} color={textColor} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bellBtn,
                  isDark && { backgroundColor: "rgba(30,41,59,0.5)" },
                ]}
              >
                <Bell size={22} color={textColor} />
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            <View style={styles.welcomeRow}>
              <View style={styles.welcomeTextContainer}>
                <Text style={[styles.greeting, { color: subTextColor }]}>
                  Welcome back,
                </Text>
                <Text
                  style={[styles.username, { color: textColor }]}
                  numberOfLines={1}
                >
                  {profile?.full_name?.split(" ")[0] || "Partner"} 👋
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsVideoModalOpen(true)}
              >
                <GlassView intensity={80} style={styles.guidanceBtn}>
                  <LinearGradient
                    colors={[
                      "rgba(79, 70, 229, 0.9)",
                      "rgba(99, 102, 241, 0.9)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.guidanceGradient}
                  >
                    <Play size={14} color="#fff" fill="#fff" />
                    <Text style={styles.guidanceText}>Guidance</Text>
                  </LinearGradient>
                </GlassView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Grid - GLASS EFFECT */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              {/* Today */}
              <GlassView
                intensity={60}
                style={[
                  styles.statCard,
                  {
                    borderColor: borderColor,
                    backgroundColor: isDark ? "rgba(30,41,59,0.4)" : undefined,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statIconBox,
                    { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                  ]}
                >
                  <HandCoins size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>
                    Today
                  </Text>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    ₹{data.stats.today}
                  </Text>
                </View>
              </GlassView>

              {/* Monthly */}
              <GlassView
                intensity={60}
                style={[
                  styles.statCard,
                  {
                    borderColor: borderColor,
                    backgroundColor: isDark ? "rgba(30,41,59,0.4)" : undefined,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statIconBox,
                    { backgroundColor: "rgba(139, 92, 246, 0.1)" },
                  ]}
                >
                  <TrendingUp size={20} color="#8b5cf6" />
                </View>
                <View>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>
                    Monthly
                  </Text>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    ₹{data.stats.monthly}
                  </Text>
                </View>
              </GlassView>
            </View>

            {/* Total Balance - Full Width */}
            <GlassView
              intensity={70}
              style={[
                styles.statCard,
                styles.statCardFull,
                {
                  borderColor: borderColor,
                  backgroundColor: isDark ? "rgba(30,41,59,0.4)" : undefined,
                },
              ]}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={[
                    styles.statIconBox,
                    { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                  ]}
                >
                  <Wallet size={20} color="#10b981" />
                </View>
                <View>
                  <Text style={[styles.statLabel, { color: subTextColor }]}>
                    Total Earnings
                  </Text>
                  <Text style={[styles.statValue, { color: textColor }]}>
                    ₹{data.stats.total}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={subTextColor} />
            </GlassView>
          </View>

          {/* Ongoing Task - Premium Dark Card */}
          {data.ongoingTask && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Active Mission
                </Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.9}>
                <LinearGradient
                  colors={["#0f172a", "#1e293b", "#334155"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ongoingCard}
                >
                  {/* Subtle glass overlay inside dark card */}
                  <View style={styles.glassOverlay} />

                  <View style={styles.ongoingHeader}>
                    <View style={styles.ongoingIconBox}>
                      {getIcon(data.ongoingTask.icon_type, "#22d3ee")}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ongoingTitle} numberOfLines={1}>
                        {data.ongoingTask.title}
                      </Text>
                      <Text style={styles.ongoingCategory}>
                        {data.ongoingTask.category}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ongoingActions}>
                    <TouchableOpacity style={styles.resumeBtn}>
                      <Text style={styles.resumeBtnText}>Resume Task</Text>
                      <ChevronRight size={16} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.claimBtn}>
                      <Text style={styles.claimBtnText}>Claim Reward</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Available Tasks */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Available Opportunities
            </Text>
            <View style={styles.taskList}>
              {data.tasks.map((task, index) => {
                const isJoined = data.ongoingTask?.id === task.id;

                return (
                  <View
                    key={task.id}
                    style={[
                      styles.taskCard,
                      { backgroundColor: cardBg, borderColor: borderColor },
                    ]}
                  >
                    <View style={styles.taskLeft}>
                      <View
                        style={[
                          styles.taskIconBox,
                          {
                            backgroundColor: isDark
                              ? "rgba(255,255,255,0.05)"
                              : index % 2 === 0
                                ? "#eff6ff"
                                : "#f5f3ff",
                          },
                        ]}
                      >
                        {getIcon(
                          task.icon_type,
                          index % 2 === 0 ? "#3b82f6" : "#8b5cf6",
                        )}
                      </View>
                      <View style={styles.taskInfo}>
                        <Text
                          style={[styles.taskTitle, { color: textColor }]}
                          numberOfLines={1}
                        >
                          {task.title}
                        </Text>
                        <Text
                          style={[styles.taskCategory, { color: subTextColor }]}
                        >
                          {task.category}
                        </Text>
                      </View>
                    </View>

                    {isJoined ? (
                      <View style={styles.joinedBadge}>
                        <CheckCircle2 size={14} color="#16a34a" />
                        <Text style={styles.joinedText}>Joined</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={() => handleStartTask(task)}
                        disabled={
                          joiningTaskId === task.id || !!data.ongoingTask
                        }
                      >
                        {joiningTaskId === task.id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.startBtnText}>Start</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <VideoModal
          visible={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          videoSrc="https://mhsizqmhqngcaztresmh.supabase.co/storage/v1/object/public/video/mission.mp4"
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  bgDecoration: {
    ...StyleSheet.absoluteFillObject,
  },
  blob1: {
    position: "absolute",
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(59, 130, 246, 0.1)", // Blue transparent
    opacity: 0.8,
  },
  blob2: {
    position: "absolute",
    top: 50,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(139, 92, 246, 0.1)", // Purple transparent
    opacity: 0.8,
  },
  blob3: {
    position: "absolute",
    bottom: -50,
    left: 100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(34, 211, 238, 0.08)",
    opacity: 0.6,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 10,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  menuBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  bellBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Changed from flex-end to center for better alignment
    gap: 10,
  },
  welcomeTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  greeting: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  guidanceBtn: {
    borderRadius: 20,
    overflow: "hidden", // Crucial for GlassView wrapping
  },
  guidanceGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  guidanceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  statsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  statCardFull: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#475569", // Darker for readability on glass
    fontWeight: "600",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ef4444",
  },
  liveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ef4444",
    textTransform: "uppercase",
  },
  ongoingCard: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: "relative",
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  ongoingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  ongoingIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  ongoingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  ongoingCategory: {
    fontSize: 13,
    color: "#94a3b8",
  },
  ongoingActions: {
    flexDirection: "row",
    gap: 12,
  },
  resumeBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#22d3ee",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  resumeBtnText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },
  claimBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  claimBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  taskList: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  taskIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  taskCategory: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  startBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
    alignItems: "center",
  },
  startBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  joinedText: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 12,
  },
});
