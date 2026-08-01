import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
  Linking,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  Info,
  Users,
  Rocket,
  Edit2,
  Briefcase,
  Menu,
  Bell,
} from "lucide-react-native";
import { GlassView } from "@/components/GlassView";
import { Skeleton } from "@/components/Skeleton";
import { useTheme } from "@/lib/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DrawerActions,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { CustomTaskModal } from "@/components/CustomTaskModal";
import { decode } from "base64-arraybuffer";

interface Task {
  id: string;
  title: string;
  type?: string;
  task_type?: string;
  target_audience?: string[];
  icon_type: string;
  status?: string;
  action_link?: string;
  reward_free?: number;
  reward?: number;
  reward_member?: number;
  reward_premium?: number;
  reward_info?: string;
  performance_info?: string;
  video_url?: string;
  video_link?: string;
  pdf_url?: string;
  proof_url?: string;
  created_at: string;
}

export default function TasksScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Task");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeCustomTask, setActiveCustomTask] = useState<Task | null>(null);

  // Filter states
  const [selectedProfessions, setSelectedProfessions] = useState<{
    [key: string]: boolean;
  }>({
    All: true,
    Student: false,
    "House Wife": false,
    "Working Professional": false,
    "Part Time": false,
  });
  const [selectedTypes, setSelectedTypes] = useState<{
    [key: string]: boolean;
  }>({
    All: false, // Default to false
    Daily: true, // Default to true
    Weekly: false,
    Company: false,
    Dedicated: false,
  });
  // Tabs State
  const [activeTypeTab, setActiveTypeTab] = useState<"Daily" | "Dedicated">(
    "Daily",
  );

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme Colors
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const glassTint = isDark ? "dark" : "light";
  const iconColor = isDark ? "#fff" : "#1e293b";
  const cardBorderColor = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(255, 255, 255, 0.5)";
  const searchBgColor = isDark
    ? "rgba(30, 41, 59, 0.6)"
    : "rgba(255, 255, 255, 0.6)";

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadCount();
    }, []),
  );

  const fetchUnreadCount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Count unread notifications
    // Simple verification against DB count
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    // Note: This doesn't account for 'global' reads stored locally,
    // but for badge consistency with Home, it's safer to stick to DB for now
    // or implement the same local storage logic if needed.
    // For now, let's use the DB count for consistency.

    if (count !== null) setUnreadCount(count);
  };

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTasks([]);
        return;
      }
      const { data, error } = await supabase.functions.invoke("dashboard-api", {
        body: { action: "get-tasks" },
      });
      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      if (!refreshing) setLoading(false);
      setRefreshing(false);
      if (refreshing) setTimeout(() => setLoading(false), 500);
    }
  };

  const onRefresh = React.useCallback(() => {
    setLoading(true);
    setRefreshing(true);
    fetchTasks();
  }, []);

  const handleTakeTask = async (task: Task) => {
    if (task.action_link) {
      Linking.openURL(task.action_link);
    }

    try {
      const { error } = await supabase.functions.invoke("dashboard-api", {
        body: { action: "start-task", taskId: task.id },
      });

      if (error) throw error;

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "ongoing" } : t)),
      );
      Alert.alert("Task Started", "You can now proceed with the task.");
    } catch (e: any) {
      Alert.alert("Error", "Failed to start task: " + e.message);
    }
  };

  const getSmartLabel = (task: Task) => {
    if (task.status === "submitted") return "Under Review";
    // If completed with proof, it means proof was submitted and awaiting review
    if (task.status === "completed" && task.proof_url) return "Under Review";
    if (task.status === "ongoing" || task.status === "in_progress")
      return "Submit Proof";
    if (task.status === "completed") return "Submit Proof";
    if (task.status === "approved") return "Claim Reward";
    return "Start Task";
  };

  const getSmartBtnColors = (task: Task): [string, string] => {
    if (task.status === "submitted") return ["#f59e0b", "#d97706"];
    if (task.status === "completed" && task.proof_url) return ["#f59e0b", "#d97706"];
    if (task.status === "ongoing" || task.status === "in_progress")
      return ["#3b82f6", "#2563eb"];
    if (task.status === "completed")
      return ["#3b82f6", "#2563eb"];
    if (task.status === "approved")
      return ["#10b981", "#059669"];
    return ["#0f172a", "#334155"];
  };

  const handleUploadProof = async (task: Task) => {
    try {
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photos to upload proof.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        allowsEditing: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const fileName = `proof_${task.id}_${Date.now()}.jpg`;

      // Read image as base64 and send to edge function (bypasses storage RLS)
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Data = await base64Promise;

      // Submit proof via edge function (handles both upload and DB update)
      const { data, error } = await supabase.functions.invoke("dashboard-api", {
        body: {
          action: "submit-proof",
          taskId: task.id,
          proofFileName: fileName,
          proofBase64: base64Data,
        },
      });

      if (error) throw error;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "completed", proof_url: fileName } : t
        )
      );

      Alert.alert(
        "Proof Submitted! ✅",
        "Your task proof has been submitted for review. You'll be notified once approved."
      );
    } catch (e: any) {
      Alert.alert("Upload Failed", e.message || "Could not upload proof. Please try again.");
    }
  };

  const handleClaimReward = async (task: Task) => {
    try {
      const { data, error } = await supabase.functions.invoke("dashboard-api", {
        body: {
          action: "claim-reward",
          taskId: task.id,
        },
      });

      if (error) throw error;

      const reward = task.reward_member || task.reward_free || task.reward || 0;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "claimed" } : t
        )
      );

      Alert.alert(
        "Reward Claimed! 🎉",
        `₹${reward} has been credited to your Mudralaya wallet.`
      );
    } catch (e: any) {
      Alert.alert("Claim Failed", e.message || "Could not claim reward. Please try again.");
    }
  };

  const handleSmartAction = (task: Task) => {
    const isCustomTask = task.task_type === 'Mudralaya Custom' || task.type === 'Mudralaya Custom';
    if (isCustomTask && (task.status === undefined || task.status === 'ongoing' || task.status === 'in_progress' || !task.status)) {
      setActiveCustomTask(task);
      return;
    }

    const label = getSmartLabel(task);
    if (label === "Submit Proof") {
      handleUploadProof(task);
    } else if (label === "Claim Reward") {
      handleClaimReward(task);
    } else if (label === "Under Review") {
      Alert.alert(
        "Under Review",
        "Your task proof is being reviewed by our team. You'll be notified once approved."
      );
    } else {
      handleTakeTask(task);
    }
  };

  const handleCustomTaskSubmit = async (responses: Record<string, any>, fileUploads: Record<string, { uri: string, name: string, base64: string }>) => {
    if (!activeCustomTask) return;
    try {
      setLoading(true);
      
      // Ensure the task is started first (dashboard-api handles it or we can call start-task)
      if (activeCustomTask.status !== 'ongoing' && activeCustomTask.status !== 'in_progress') {
        const { error: startError } = await supabase.functions.invoke("dashboard-api", {
          body: { action: "start-task", taskId: activeCustomTask.id },
        });
        if (startError) throw startError;
      }

      // Upload files directly to Supabase storage
      const finalResponses = { ...responses };
      for (const [qId, fileData] of Object.entries(fileUploads)) {
        const path = `custom-task-uploads/${activeCustomTask.id}/${Date.now()}_${fileData.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("task-submissions")
          .upload(path, decode(fileData.base64), { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("task-submissions")
          .getPublicUrl(uploadData.path);

        finalResponses[qId] = publicUrl;
      }

      // Submit completed task
      const { error: completeError } = await supabase.functions.invoke("dashboard-api", {
        body: { 
          action: "complete-task", 
          taskId: activeCustomTask.id,
          submissionData: { responses: finalResponses }
        },
      });

      if (completeError) throw completeError;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeCustomTask.id ? { ...t, status: "completed" } : t
        )
      );

      Alert.alert(
        "Task Completed! ✅",
        "Your task response has been submitted for review. You'll be notified once approved."
      );
      
      setActiveCustomTask(null);
    } catch (e: any) {
      console.error(e);
      Alert.alert("Submission Failed", e.message || "Could not submit task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const getIcon = (type: string, color: string) => {
    switch (type) {
      case "rocket":
        return <Rocket size={24} color={color} />;
      case "feedback":
        return <Edit2 size={24} color={color} />;
      case "building":
        return <Briefcase size={24} color={color} />;
      case "group":
      default:
        return <Users size={24} color={color} />;
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter((task) => {
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;

    if (activeTab === "Completed" && task.status !== "completed") return false;
    if (
      activeTab === "Ongoing" &&
      task.status !== "ongoing" &&
      task.status !== "in_progress"
    )
      return false;

    // Profession Filter
    const activeProfessions = Object.keys(selectedProfessions).filter(
      (k) => k !== "All" && selectedProfessions[k],
    );
    const professionMatch =
      selectedProfessions["All"] ||
      !task.target_audience ||
      task.target_audience.some((aud) => activeProfessions.includes(aud)) ||
      activeProfessions.length === 0;

    // Type Filter (Tab Based)
    // If Daily: Show task_type='Daily' (or null/empty/not dedicated for backward compat)
    // If Dedicated: Show task_type='Dedicated'
    const isDailyTab = activeTypeTab === "Daily";
    const taskType = task.task_type || "Daily"; // Default to Daily if null

    if (isDailyTab) {
      // Show if type is Daily
      if (taskType === "Dedicated") return false;
    } else {
      // Dedicated Tab
      if (taskType !== "Dedicated") return false;
    }

    return professionMatch; // Removed old typeMatch
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar: Menu & Bell */}
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={[
            styles.menuBtn,
            isDark && { backgroundColor: "rgba(30,41,59,0.5)" },
          ]}
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        >
          <Menu size={24} color={iconColor} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bellBtn,
            isDark && { backgroundColor: "rgba(30,41,59,0.5)" },
          ]}
          onPress={() => router.push("/notifications")}
        >
          <Bell size={22} color={iconColor} />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCountText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <GlassView
          intensity={50}
          style={[
            styles.searchContainer,
            { borderColor: cardBorderColor, backgroundColor: searchBgColor },
          ]}
          tint={glassTint}
        >
          <Search size={20} color={subTextColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search for tasks..."
            placeholderTextColor={subTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </GlassView>
      </View>

      {/* Task Type Tabs + Filter Button Row */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          marginBottom: 16,
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Daily Task Tab */}
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor:
              activeTypeTab === "Daily"
                ? isDark
                  ? "#3b82f6"
                  : "#2563eb"
                : isDark
                  ? "rgba(30,41,59,0.5)"
                  : "#fff",
            alignItems: "center",
            borderWidth: 1,
            borderColor:
              activeTypeTab === "Daily"
                ? "transparent"
                : isDark
                  ? "rgba(255,255,255,0.1)"
                  : "#e2e8f0",
          }}
          onPress={() => setActiveTypeTab("Daily")}
        >
          <Text
            style={{
              fontWeight: "700",
              color: activeTypeTab === "Daily" ? "#fff" : subTextColor,
            }}
          >
            Daily Task
          </Text>
        </TouchableOpacity>

        {/* Dedicated Task Tab */}
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor:
              activeTypeTab === "Dedicated"
                ? isDark
                  ? "#db2777"
                  : "#db2777"
                : isDark
                  ? "rgba(30,41,59,0.5)"
                  : "#fff",
            alignItems: "center",
            borderWidth: 1,
            borderColor:
              activeTypeTab === "Dedicated"
                ? "transparent"
                : isDark
                  ? "rgba(255,255,255,0.1)"
                  : "#e2e8f0",
          }}
          onPress={() => setActiveTypeTab("Dedicated")}
        >
          <Text
            style={{
              fontWeight: "700",
              color: activeTypeTab === "Dedicated" ? "#fff" : subTextColor,
            }}
          >
            Dedicated Task
          </Text>
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity
          style={[
            styles.filterBtn,
            isDark && {
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              borderColor: cardBorderColor,
            },
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color={iconColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {["All Task", "Completed", "Ongoing"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab)}
            >
              {isActive ? (
                <LinearGradient
                  colors={["#0f172a", "#1e293b"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeTab}
                >
                  <Text style={styles.activeTabText}>{tab}</Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.tab,
                    isDark && {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.1)",
                    },
                  ]}
                >
                  <Text
                    style={[styles.tabText, isDark && { color: "#94a3b8" }]}
                  >
                    {tab}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={isDark ? ["#0f172a", "#1e1b4b"] : ["#f0fdf4", "#f8fafc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.blob1} />
        <View style={styles.blob2} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {loading ? (
          <View style={{ padding: 20, gap: 16 }}>
            {/* Header Skeleton */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Skeleton width={40} height={40} borderRadius={12} />
              <Skeleton width={40} height={40} borderRadius={12} />
            </View>
            <Skeleton width="100%" height={50} borderRadius={16} />

            {/* Tabs Skeleton */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Skeleton width={80} height={36} borderRadius={20} />
              <Skeleton width={80} height={36} borderRadius={20} />
              <Skeleton width={80} height={36} borderRadius={20} />
            </View>

            {/* Task Cards Skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{ marginTop: 20 }}>
                <Skeleton width="100%" height={100} borderRadius={20} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            ListHeaderComponent={renderHeader}
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
              <GlassView
                intensity={70}
                style={[styles.taskCard, { borderColor: cardBorderColor }]}
                tint={glassTint}
              >
                <TouchableOpacity
                  style={styles.cardHeader}
                  activeOpacity={0.8}
                  onPress={() => toggleExpand(item.id)}
                >
                  <View style={styles.headerLeft}>
                    <View style={[styles.iconContainer]}>
                      {getIcon(item.icon_type, "#ef4444")}
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={[styles.taskTitle, { color: textColor }]}>
                        {item.title}
                      </Text>
                      <View style={styles.metaRow}>
                        <View
                          style={[
                            styles.categoryBadge,
                            isDark && {
                              backgroundColor: "rgba(255,255,255,0.1)",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              isDark && { color: "#cbd5e1" },
                            ]}
                          >
                            {item.task_type || "Daily"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.headerRight}>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardText}>
                        ₹ {item.reward_free || item.reward}
                      </Text>
                    </View>
                    {expandedTaskId === item.id ? (
                      <ChevronUp size={20} color="#64748b" />
                    ) : (
                      <ChevronDown size={20} color="#64748b" />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedTaskId === item.id && (
                  <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    <View
                      style={[
                        styles.rewardDetails,
                        isDark && {
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderColor: "rgba(255,255,255,0.1)",
                        },
                      ]}
                    >
                      <View style={styles.priceColumn}>
                        <Text
                          style={[styles.priceLabel, { color: subTextColor }]}
                        >
                          Members
                        </Text>
                        <Text style={[styles.priceValue, { color: "#3b82f6" }]}>
                          ₹ {item.reward_member || item.reward_premium || 800}
                        </Text>
                      </View>
                      <View style={styles.verticalDivider} />
                      <View style={styles.priceColumn}>
                        <Text
                          style={[styles.priceLabel, { color: subTextColor }]}
                        >
                          Free User
                        </Text>
                        <Text style={[styles.priceValue, { color: "#10b981" }]}>
                          ₹ {item.reward_free || item.reward || 600}
                        </Text>
                      </View>
                    </View>

                    {item.reward_info && (
                      <Text
                        style={[styles.rewardInfo, { color: subTextColor }]}
                      >
                        {item.reward_info}
                      </Text>
                    )}

                    <View style={styles.resources}>
                      {(item.video_url || item.video_link) && (
                        <TouchableOpacity
                          style={styles.resourceBtn}
                          onPress={() =>
                            Linking.openURL(
                              item.video_url || item.video_link || "",
                            )
                          }
                        >
                          <PlayCircle size={18} color="#ef4444" />
                          <Text style={styles.resourceText}>
                            Watch Guidance
                          </Text>
                        </TouchableOpacity>
                      )}
                      {item.pdf_url && (
                        <TouchableOpacity
                          style={styles.resourceBtn}
                          onPress={() => Linking.openURL(item.pdf_url || "")}
                        >
                          <FileText size={18} color="#ef4444" />
                          <Text style={styles.resourceText}>
                            Read Instructions
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleSmartAction(item)}
                      disabled={item.status === "claimed"}
                    >
                      <LinearGradient
                        colors={item.status === "claimed" ? ["#64748b", "#64748b"] : getSmartBtnColors(item)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.actionBtn, item.status === "claimed" && { opacity: 0.6 }]}
                      >
                        <Text style={styles.actionBtnText}>
                          {item.status === "claimed" ? "✓ Reward Claimed" : getSmartLabel(item)}
                        </Text>
                        {item.status !== "claimed" && !(item.status === "completed" && item.proof_url) && item.status !== "submitted" && (
                          <Rocket size={18} color="#fff" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Show proof preview if submitted */}
                    {item.proof_url && (item.status === "submitted" || item.status === "completed") && (
                      <View style={{
                        marginTop: 12,
                        padding: 12,
                        backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "#fffbeb",
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#f59e0b" }} />
                        <Text style={{ color: isDark ? "#fbbf24" : "#92400e", fontSize: 13, fontWeight: "600" }}>
                          Proof submitted • Awaiting admin review
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </GlassView>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No tasks found matching your criteria.
                </Text>
              </View>
            }
          />
        )}

        {/* Filter Modal - Kept Simple & Clean */}
        <Modal
          visible={filterModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View
            style={[
              styles.modalContainer,
              isDark && { backgroundColor: "#1e293b" },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                isDark && {
                  backgroundColor: "#1e293b",
                  borderBottomColor: "#334155",
                },
              ]}
            >
              <Text style={[styles.modalTitle, isDark && { color: "#fff" }]}>
                Filter Tasks
              </Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={[
                  styles.closeBtn,
                  isDark && { backgroundColor: "#334155" },
                ]}
              >
                <Text
                  style={[styles.closeText, isDark && { color: "#60a5fa" }]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text
                style={[
                  styles.filterSectionTitle,
                  isDark && { color: "#cbd5e1" },
                ]}
              >
                Target Audience
              </Text>
              {Object.keys(selectedProfessions).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.checkboxRow,
                    isDark && {
                      backgroundColor: "#334155",
                      borderColor: "#475569",
                    },
                  ]}
                  onPress={() => {
                    if (key === "All") {
                      setSelectedProfessions({
                        All: true,
                        Student: false,
                        "House Wife": false,
                        "Working Professional": false,
                        "Part Time": false,
                      });
                    } else {
                      const newState = {
                        ...selectedProfessions,
                        [key]: !selectedProfessions[key],
                      };
                      newState["All"] = false;
                      setSelectedProfessions(newState);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedProfessions[key] && styles.checked,
                      isDark && { borderColor: "#94a3b8" },
                      selectedProfessions[key] &&
                        isDark && {
                          backgroundColor: "#fff",
                          borderColor: "#fff",
                        },
                    ]}
                  >
                    {selectedProfessions[key] && (
                      <View style={styles.checkedDot} />
                    )}
                  </View>
                  <Text
                    style={[styles.filterLabel, isDark && { color: "#f1f5f9" }]}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text
                style={[
                  styles.filterSectionTitle,
                  { marginTop: 24 },
                  isDark && { color: "#cbd5e1" },
                ]}
              >
                Task Type
              </Text>
              {Object.keys(selectedTypes).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.checkboxRow,
                    isDark && {
                      backgroundColor: "#334155",
                      borderColor: "#475569",
                    },
                  ]}
                  onPress={() => {
                    if (key === "All") {
                      setSelectedTypes({
                        All: true,
                        Daily: false,
                        Weekly: false,
                        Company: false,
                        Dedicated: false,
                      });
                    } else {
                      const newState = {
                        ...selectedTypes,
                        [key]: !selectedTypes[key],
                      };
                      newState["All"] = false;
                      setSelectedTypes(newState);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedTypes[key] && styles.checked,
                      isDark && { borderColor: "#94a3b8" },
                      selectedTypes[key] &&
                        isDark && {
                          backgroundColor: "#fff",
                          borderColor: "#fff",
                        },
                    ]}
                  >
                    {selectedTypes[key] && <View style={styles.checkedDot} />}
                  </View>
                  <Text
                    style={[styles.filterLabel, isDark && { color: "#f1f5f9" }]}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>

        <CustomTaskModal
          task={activeCustomTask}
          visible={!!activeCustomTask}
          onClose={() => setActiveCustomTask(null)}
          onSubmit={handleCustomTaskSubmit}
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
    top: 100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(239, 68, 68, 0.05)", // Red transparent
    opacity: 0.6,
  },
  blob2: {
    position: "absolute",
    bottom: -50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(59, 130, 246, 0.05)", // Blue transparent
    opacity: 0.6,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
    paddingHorizontal: 2,
  },
  notificationCountText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 5,
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
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  filterBtn: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 4,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  tabText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 13,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  taskCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardHeader: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(239, 68, 68, 0.1)", // Red tint
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.1)",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "rgba(100, 116, 139, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 12,
  },
  rewardBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  rewardText: {
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 13,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginBottom: 16,
  },
  rewardDetails: {
    flexDirection: "row",
    backgroundColor: "rgba(241, 245, 249, 0.5)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  priceColumn: {
    flex: 1,
    alignItems: "center",
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#cbd5e1",
    height: "80%",
    alignSelf: "center",
  },
  priceLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  rewardInfo: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 16,
    marginTop: -8,
    paddingHorizontal: 4,
    lineHeight: 20,
  },
  resources: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  resourceBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
  },
  resourceText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 12,
  },
  actionBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
  },
  closeText: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    borderColor: "#0f172a",
    backgroundColor: "#fff",
  },
  checkedDot: {
    width: 12,
    height: 12,
    backgroundColor: "#0f172a",
    borderRadius: 3,
  },
  filterLabel: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
});
