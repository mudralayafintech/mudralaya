import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Bell,
  Check,
  Clock,
  Trash2,
  CheckCheck,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDistanceToNow } from "date-fns";

import { Skeleton } from "@/components/Skeleton";

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get local persistent state
      const [lastClearedStr, lastReadAllStr] = await Promise.all([
        AsyncStorage.getItem(`notif_cleared_${user.id}`),
        AsyncStorage.getItem(`notif_read_all_${user.id}`),
      ]);

      const lastClearedAt = lastClearedStr ? new Date(lastClearedStr) : null;
      const lastReadAllAt = lastReadAllStr ? new Date(lastReadAllStr) : null;

      // 2. Fetch from Supabase
      // Optimization: We could filter by created_at > lastClearedAt in DB,
      // but simplistic approach: fetch recent 50 and filter in client (for now)
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`user_id.eq.${user.id},metadata->>is_global.eq.true`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        // 3. Filter and Map based on local state
        const validNotifications = data
          .filter((n) => {
            // Filter out items older than last cleared time
            if (lastClearedAt && new Date(n.created_at) <= lastClearedAt) {
              return false;
            }
            return true;
          })
          .map((n) => {
            // Mark items as read if they are older than last 'mark all read' time
            // and not already read
            if (
              !n.read_at &&
              lastReadAllAt &&
              new Date(n.created_at) <= lastReadAllAt
            ) {
              return { ...n, read_at: lastReadAllAt.toISOString() }; // Virtual read
            }
            return n;
          });

        setNotifications(validNotifications);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
      ),
    );
    // Optimistically update DB (may fail for global but UI is updated locally)
    await supabase
      .from("notifications")
      .update({ read_at: new Date() })
      .eq("id", id);
  };

  const markAllAsRead = async () => {
    const now = new Date();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Update Local State
    await AsyncStorage.setItem(`notif_read_all_${user.id}`, now.toISOString());

    // 2. Update UI
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || now.toISOString() })),
    );

    // 3. Attempt DB sync for personal items
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", user.id)
      .is("read_at", null);
  };

  const clearAll = async () => {
    Alert.alert(
      "Clear All",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const now = new Date();
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Update Local State (Virtual Clear)
            await AsyncStorage.setItem(
              `notif_cleared_${user.id}`,
              now.toISOString(),
            );

            // 2. Update UI
            setNotifications([]);

            // 3. Attempt DB sync for personal items (Optional, keeps DB clean)
            await supabase
              .from("notifications")
              .delete()
              .eq("user_id", user.id);
          },
        },
      ],
    );
  };

  const isDark = theme === "dark";
  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const cardBg = isDark ? "rgba(30, 41, 59, 0.8)" : "#fff";

  const NotificationSkeleton = () => (
    <View style={{ gap: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: "transparent" },
          ]}
        >
          <Skeleton
            width={40}
            height={40}
            borderRadius={20}
            style={{ marginRight: 16 }}
          />
          <View style={{ flex: 1, gap: 8 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Skeleton width="60%" height={16} />
              <Skeleton width="20%" height={12} />
            </View>
            <Skeleton width="90%" height={14} />
            <Skeleton width="70%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Notifications</Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {notifications.some((n) => !n.read_at) && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.iconBtn}>
              <CheckCheck size={20} color="#4f46e5" />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll} style={styles.iconBtn}>
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
          {notifications.length === 0 && <View style={{ width: 24 }} />}
        </View>
      </View>

      {loading ? (
        <View style={styles.listContent}>
          <NotificationSkeleton />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => fetchNotifications(true)}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Bell size={48} color={isDark ? "#334155" : "#cbd5e1"} />
              <Text
                style={[
                  styles.emptyText,
                  { color: isDark ? "#64748b" : "#94a3b8" },
                ]}
              >
                No notifications yet
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: cardBg },
                !item.read_at && styles.unreadCard,
              ]}
              onPress={() => markAsRead(item.id)}
            >
              <View style={styles.iconBox}>
                <Bell size={20} color="#4f46e5" />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: textColor }]}>
                    {item.title}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.cardBody,
                    { color: isDark ? "#94a3b8" : "#64748b" },
                  ]}
                >
                  {item.message}
                </Text>
              </View>
              {!item.read_at && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  listContent: {
    padding: 20,
  },
  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "flex-start",
    gap: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    // Removing shadow/elevation as requested
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
    backgroundColor: "#fff",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
    flex: 1,
    paddingRight: 8,
  },
  timeText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "500",
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4f46e5",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
});
