import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { supabase } from "@/lib/supabase";
import {
  ArrowUpRight,
  ArrowDownLeft,
  BarChart2,
  RefreshCw,
  CreditCard,
  Award,
  MoreVertical,
  Rocket,
  MessageSquare,
  Megaphone,
  CheckCircle,
  AlertCircle,
  Edit2,
  Menu,
  ChevronRight,
  HelpCircle,
  Bell,
} from "lucide-react-native";
import { GlassView } from "@/components/GlassView";
import { Skeleton } from "@/components/Skeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DrawerActions,
  useNavigation,
  useFocusEffect,
} from "@react-navigation/native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import KYCModal from "@/components/KYCModal";

import { useTheme } from "@/lib/ThemeContext";

export default function WalletScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [walletData, setWalletData] = useState({
    transactions: [],
    stats: {
      today: 0,
      monthly: 0,
      approved: 0,
      pending: 0,
      total: 0,
      payout: 0,
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    holder_name: "",
    bank_name: "",
    account_number: "",
    confirm_account_number: "", // Added confirm field
    ifsc_code: "",
  });

  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchInitialData();
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

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (count !== null) setUnreadCount(count);
  };

  const fetchInitialData = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);

      // Fetch KYC Status
      const { data: kycData } = await supabase
        .from("user_kyc")
        .select("status")
        .eq("user_id", session.user.id)
        .single();

      if (kycData) setKycStatus(kycData.status);

      // Fetch Bank Details
      const { data: bankData } = await supabase.functions.invoke(
        "bank-account",
        { method: "GET" },
      );

      if (bankData && Object.keys(bankData).length > 0) {
        setBankDetails(bankData);
        setFormData({
          holder_name: bankData.holder_name,
          bank_name: bankData.bank_name,
          account_number: bankData.account_number,
          confirm_account_number: bankData.account_number,
          ifsc_code: bankData.ifsc_code,
        });
      }

      // Fetch Wallet Summary
      const { data: summary } = await supabase.functions.invoke(
        "dashboard-api",
        {
          body: { action: "get-dashboard-summary" },
        },
      );

      if (summary) {
        setWalletData({
          transactions: summary.transactions || [],
          stats: {
            today: summary.stats?.today || 0,
            monthly: summary.stats?.monthly || 0,
            approved: summary.stats?.approved || 0,
            pending: summary.stats?.pending || 0,
            total: summary.stats?.total || 0,
            payout: summary.stats?.payout || 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (!refreshing) setLoading(false);
      setRefreshing(false);
      if (refreshing) setTimeout(() => setLoading(false), 500);
    }
  };

  const onRefresh = React.useCallback(() => {
    setLoading(true);
    setRefreshing(true);
    fetchInitialData();
  }, []);

  const handleSaveBank = async () => {
    try {
      // Basic validation
      if (!formData.account_number || !formData.ifsc_code) {
        Alert.alert("Error", "Please fill in all bank details");
        return;
      }

      if (formData.account_number !== formData.confirm_account_number) {
        Alert.alert("Error", "Account numbers do not match");
        return;
      }

      const { error } = await supabase.functions.invoke("bank-account", {
        method: "POST",
        body: {
          holder_name: formData.holder_name,
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          ifsc_code: formData.ifsc_code,
        }, // Exclude confirm_account_number from API call
      });

      if (error) throw error;

      setBankDetails(formData);
      setIsEditing(false);
      Alert.alert("Success", "Bank details saved successfully");
    } catch (e: any) {
      Alert.alert("Error", "Failed to save: " + e.message);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "feedback":
        return <MessageSquare size={20} color="#3b82f6" />;
      case "rocket":
        return <Rocket size={20} color="#ef4444" />;
      case "campaign":
        return <Megaphone size={20} color="#f59e0b" />;
      default:
        return <Megaphone size={20} color="#64748b" />;
    }
  };

  const isDark = theme === "dark";
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const iconColor = isDark ? "#fff" : "#1e293b";
  const inputBg = isDark ? "#1e293b" : "#fff";
  // Use a glass-like dark bg for cards to match GlassView defaults or override them
  const cardBg = isDark ? "rgba(30, 41, 59, 0.6)" : "#fff";
  const borderColor = isDark ? "transparent" : "rgba(255,255,255,0.5)";

  const WalletSkeleton = () => (
    <View style={{ gap: 24, padding: 20 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Skeleton width={40} height={40} borderRadius={12} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Skeleton width={80} height={32} borderRadius={20} />
          <Skeleton width={40} height={40} borderRadius={12} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Skeleton width="48%" height={80} borderRadius={24} />
        <Skeleton width="48%" height={80} borderRadius={24} />
      </View>

      {/* Metrics Row */}
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="47%" height={100} borderRadius={24} />
        ))}
      </View>

      {/* Payout Card */}
      <Skeleton width="100%" height={180} borderRadius={24} />

      {/* Bank Details */}
      <Skeleton width="100%" height={200} borderRadius={24} />

      {/* Recent Transactions */}
      <View>
        <Skeleton width={150} height={20} style={{ marginBottom: 12 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            width="100%"
            height={70}
            borderRadius={20}
            style={{ marginBottom: 10 }}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={isDark ? ["#0f172a", "#1e1b4b"] : ["#fff", "#f0f9ff"]}
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
              tintColor="#ea580c"
            />
          }
        >
          {loading ? (
            <WalletSkeleton />
          ) : (
            <>
              <View style={styles.headerContainer}>
                {/* Top Bar: Menu, KYC & Bell */}
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

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.kycBadge,
                        kycStatus === "verified"
                          ? {
                              backgroundColor: "#dcfce7",
                              borderColor: "#bbf7d0",
                            } // Green
                          : kycStatus === "rejected"
                            ? {
                                backgroundColor: "#fee2e2",
                                borderColor: "#fecaca",
                              } // Red
                            : {
                                backgroundColor: "#ffedd5",
                                borderColor: "#fed7aa",
                              }, // Orange
                        { marginBottom: 0 }, // Reset margin for top bar placement
                      ]}
                      onPress={() => {
                        if (kycStatus !== "verified") setKycModalVisible(true);
                      }}
                    >
                      {kycStatus === "verified" ? (
                        <CheckCircle size={14} color="#16a34a" />
                      ) : kycStatus === "rejected" ? (
                        <AlertCircle size={14} color="#ef4444" />
                      ) : (
                        <AlertCircle size={14} color="#f97316" />
                      )}
                      <Text
                        style={[
                          styles.kycText,
                          kycStatus === "verified"
                            ? { color: "#16a34a" }
                            : kycStatus === "rejected"
                              ? { color: "#ef4444" }
                              : { color: "#c2410c" },
                        ]}
                      >
                        {kycStatus === "verified" ? "Verified" : "KYC"}
                      </Text>
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
                </View>
              </View>

              {/* Stats Grid - Premium Glass */}
              <View style={styles.statsGrid}>
                <GlassView
                  intensity={70}
                  style={[styles.statCardLarge, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: "rgba(249, 115, 22, 0.1)" },
                    ]}
                  >
                    <ArrowUpRight size={22} color="#f97316" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Today's Pending</Text>
                    <Text style={[styles.statValue, { color: textColor }]}>
                      ₹ {walletData.stats.today}
                    </Text>
                  </View>
                </GlassView>

                <GlassView
                  intensity={70}
                  style={[styles.statCardLarge, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: "rgba(168, 85, 247, 0.1)" },
                    ]}
                  >
                    <ArrowDownLeft size={22} color="#a855f7" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>This Month</Text>
                    <Text style={[styles.statValue, { color: textColor }]}>
                      ₹ {walletData.stats.monthly}
                    </Text>
                  </View>
                </GlassView>
              </View>

              <View style={styles.metricsRow}>
                <GlassView
                  intensity={50}
                  style={[styles.metricCard, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[styles.metricIcon, { backgroundColor: "#f0fdf4" }]}
                  >
                    <BarChart2 size={18} color="#16a34a" />
                  </View>
                  <Text style={[styles.metricValue, { color: textColor }]}>
                    ₹ {walletData.stats.approved}
                  </Text>
                  <Text style={styles.metricLabel}>Approved</Text>
                </GlassView>

                <GlassView
                  intensity={50}
                  style={[styles.metricCard, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[styles.metricIcon, { backgroundColor: "#fff7ed" }]}
                  >
                    <RefreshCw size={18} color="#f97316" />
                  </View>
                  <Text style={[styles.metricValue, { color: textColor }]}>
                    ₹ {walletData.stats.pending}
                  </Text>
                  <Text style={styles.metricLabel}>Pending</Text>
                </GlassView>

                <GlassView
                  intensity={50}
                  style={[styles.metricCard, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[styles.metricIcon, { backgroundColor: "#eff6ff" }]}
                  >
                    <CreditCard size={18} color="#3b82f6" />
                  </View>
                  <Text style={[styles.metricValue, { color: textColor }]}>
                    ₹ {walletData.stats.total}
                  </Text>
                  <Text style={styles.metricLabel}>Total</Text>
                </GlassView>

                <GlassView
                  intensity={50}
                  style={[styles.metricCard, { borderColor }]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View
                    style={[styles.metricIcon, { backgroundColor: "#f5f3ff" }]}
                  >
                    <Award size={18} color="#8b5cf6" />
                  </View>
                  <Text style={[styles.metricValue, { color: textColor }]}>
                    ₹ {walletData.stats.payout}
                  </Text>
                  <Text style={styles.metricLabel}>Payout</Text>
                </GlassView>
              </View>

              {/* Payout Section - Dark Premium Card */}
              <View style={styles.section}>
                <LinearGradient
                  colors={["#1e293b", "#0f172a"]}
                  style={styles.payoutCard}
                >
                  <View style={styles.payoutHeader}>
                    <Text style={styles.payoutTitle}>Withdraw Funds</Text>
                    <HelpCircle size={20} color="#94a3b8" />
                  </View>

                  <View style={styles.payoutStats}>
                    <View>
                      <Text style={styles.payoutLabel}>Min. Payout</Text>
                      <Text style={styles.payoutValue}>₹ 500</Text>
                    </View>
                    <View style={styles.verticalLine} />
                    <View>
                      <Text style={styles.payoutLabel}>Pending</Text>
                      <Text style={styles.payoutValue}>
                        ₹ {walletData.stats.pending}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.withdrawBtn,
                      walletData.stats.approved < 500 &&
                        styles.withdrawBtnDisabled,
                    ]}
                    disabled={walletData.stats.approved < 500}
                    onPress={() =>
                      Alert.alert("Payout", "Payout request logic")
                    }
                  >
                    <Text
                      style={[
                        styles.withdrawBtnText,
                        walletData.stats.approved < 500 && { color: "#94a3b8" },
                      ]}
                    >
                      {walletData.stats.approved < 500
                        ? "Balance below ₹500"
                        : "Request Payout"}
                    </Text>
                    {walletData.stats.approved >= 500 && (
                      <ArrowUpRight size={18} color="#0f172a" />
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              {/* Bank Account Section */}
              <View style={styles.section}>
                <GlassView
                  intensity={60}
                  style={[
                    styles.bankCard,
                    { backgroundColor: cardBg, borderColor },
                  ]}
                  tint={isDark ? "dark" : "light"}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>
                      Bank Details
                    </Text>
                    {!isEditing && (
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => setIsEditing(true)}
                      >
                        <Edit2 size={16} color="#64748b" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {isEditing ? (
                    <View style={styles.formContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Account Holder Name"
                        placeholderTextColor="#94a3b8"
                        value={formData.holder_name}
                        onChangeText={(t) =>
                          setFormData({ ...formData, holder_name: t })
                        }
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Bank Name"
                        placeholderTextColor="#94a3b8"
                        value={formData.bank_name}
                        onChangeText={(t) =>
                          setFormData({ ...formData, bank_name: t })
                        }
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Account Number"
                        placeholderTextColor="#94a3b8"
                        value={formData.account_number}
                        onChangeText={(text) =>
                          setFormData({ ...formData, account_number: text })
                        }
                        keyboardType="number-pad"
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm Account Number"
                        placeholderTextColor="#94a3b8"
                        value={formData.confirm_account_number}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            confirm_account_number: text,
                          })
                        }
                        keyboardType="number-pad"
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="IFSC Code"
                        placeholderTextColor="#94a3b8"
                        value={formData.ifsc_code}
                        onChangeText={(t) =>
                          setFormData({ ...formData, ifsc_code: t })
                        }
                        autoCapitalize="characters"
                      />

                      <View style={styles.formActions}>
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => setIsEditing(false)}
                        >
                          <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.saveBtn}
                          onPress={handleSaveBank}
                        >
                          <Text style={styles.saveBtnText}>Save Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.bankInfo}>
                      {bankDetails ? (
                        <View style={styles.bankDetailsGrid}>
                          <View style={styles.bankDetailItem}>
                            <Text style={styles.bankLabel}>Holder Name</Text>
                            <Text
                              style={[styles.bankValue, { color: textColor }]}
                            >
                              {bankDetails.holder_name}
                            </Text>
                          </View>
                          <View style={styles.bankDetailItem}>
                            <Text style={styles.bankLabel}>Bank</Text>
                            <Text
                              style={[styles.bankValue, { color: textColor }]}
                            >
                              {bankDetails.bank_name}
                            </Text>
                          </View>
                          <View style={styles.bankDetailItem}>
                            <Text style={styles.bankLabel}>Account No.</Text>
                            <Text
                              style={[styles.bankValue, { color: textColor }]}
                            >
                              •••• {bankDetails.account_number?.slice(-4)}
                            </Text>
                          </View>
                          <View style={styles.bankDetailItem}>
                            <Text style={styles.bankLabel}>IFSC</Text>
                            <Text
                              style={[styles.bankValue, { color: textColor }]}
                            >
                              {bankDetails.ifsc_code}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.noBankState}>
                          <Text style={styles.noBankText}>
                            No bank account linked yet.
                          </Text>
                        </View>
                      )}

                      {!bankDetails && (
                        <TouchableOpacity
                          style={styles.addBankBtn}
                          onPress={() => setIsEditing(true)}
                        >
                          <Text style={styles.addBankText}>
                            Add Bank Account
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </GlassView>
              </View>

              {/* Transactions */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Recent Transactions
                </Text>
                {walletData.transactions.length > 0 ? (
                  walletData.transactions.map((t: any) => (
                    <GlassView
                      key={t.id}
                      style={[
                        styles.transactionCard,
                        { backgroundColor: cardBg, borderColor },
                      ]}
                      intensity={40}
                      tint={isDark ? "dark" : "light"}
                    >
                      <View style={styles.transLeft}>
                        <View style={styles.transIconBox}>
                          {getIcon(t.icon_type)}
                        </View>
                        <View>
                          <Text
                            style={[styles.transTitle, { color: textColor }]}
                          >
                            {t.title}
                          </Text>
                          <Text
                            style={[
                              styles.transSubtitle,
                              { color: subTextColor },
                            ]}
                          >
                            {t.sub_title}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.transAmount,
                          t.amount > 0
                            ? { color: "#16a34a" }
                            : { color: "#ef4444" },
                        ]}
                      >
                        {t.amount > 0 ? "+" : ""} ₹ {Math.abs(t.amount)}
                      </Text>
                    </GlassView>
                  ))
                ) : (
                  <View style={styles.emptyTrans}>
                    <Text style={styles.emptyTransText}>
                      No recent transactions.
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        <KYCModal
          visible={kycModalVisible}
          onClose={() => setKycModalVisible(false)}
          onSuccess={() => {
            fetchInitialData();
          }}
          userId={userId}
          status={kycStatus}
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
    top: -50,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(251, 146, 60, 0.08)", // Orange tint
    opacity: 0.8,
  },
  blob2: {
    position: "absolute",
    bottom: 100,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(168, 85, 247, 0.08)", // Purple tint
    opacity: 0.8,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 10,
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
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  notificationCountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
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
  kycBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  kycText: {
    fontWeight: "700",
    fontSize: 11,
    textTransform: "uppercase",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCardLarge: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    flexDirection: "row", // Changed to row for better space usage
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 2,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  metricIcon: {
    padding: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  payoutCard: {
    padding: 24,
    borderRadius: 24,
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  payoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  payoutTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  payoutStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  payoutLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },
  payoutValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  verticalLine: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  withdrawBtn: {
    backgroundColor: "#38bdf8", // Light blue
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  withdrawBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  withdrawBtnText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 15,
  },
  bankCard: {
    borderRadius: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  editBtn: {
    padding: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
  },
  bankInfo: {
    gap: 16,
  },
  bankDetailsGrid: {
    gap: 12,
  },
  bankDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
    paddingBottom: 8,
  },
  bankLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "500",
  },
  bankValue: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
  },
  noBankState: {
    padding: 20,
    alignItems: "center",
  },
  noBankText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  addBankBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  addBankText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  formContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 14,
    color: "#0f172a",
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#475569",
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    marginLeft: 4,
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  transLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  transIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  transTitle: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: 14,
    marginBottom: 2,
  },
  transSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  transAmount: {
    fontWeight: "700",
    fontSize: 15,
  },
  emptyTrans: {
    padding: 20,
    alignItems: "center",
  },
  emptyTransText: {
    color: "#94a3b8",
    fontSize: 14,
  },
});
