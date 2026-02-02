import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Crown,
  ArrowRight,
  Check,
  CheckCircle2,
  Menu,
  Sparkles,
  CreditCard,
  Wallet,
  Zap,
  BookOpen,
} from "lucide-react-native";
import { DrawerActions } from "@react-navigation/native";
import RazorpayCheckout from "react-native-razorpay";
import { CustomAlert } from "../../components/CustomAlert";
import { useTheme } from "../../lib/ThemeContext";
import { BlurView } from "expo-blur";
import { supabase } from "../../lib/supabase";
import { GlassView } from "../../components/GlassView";
import { Skeleton } from "../../components/Skeleton";

const { width } = Dimensions.get("window");

const BENEFITS = [
  {
    id: "01",
    title: "Earn 250 Cash",
    desc: "Get a reward of 250 in your Mudralaya Wallet as a early joining Bonus.",
  },
  {
    id: "02",
    title: "Extra Earning",
    desc: "Your will get extra earning for the same task for which other's are getting lesser",
  },
  {
    id: "03",
    title: "High Paying Task",
    desc: "You will get free access of high paying task after becoming our member",
  },
  {
    id: "04",
    title: "Free Training",
    desc: "A FREE training course worth ₹10,000 to support your journey toward financial independence",
  },
];

export default function Membership() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">(
    "yearly",
  );
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "error" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
    confirmText: "OK",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const showAlert = (
    title: string,
    message: string,
    type: "info" | "success" | "error" | "confirm" = "info",
    onConfirm?: () => void,
    confirmText = "OK",
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
    });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

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
        if (data) {
          setProfile(data);
          if (data.membership_type) {
            setBillingCycle(
              data.membership_type.toLowerCase() === "yearly"
                ? "yearly"
                : "monthly",
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      if (!refreshing) setLoading(false);
      setRefreshing(false);
      if (refreshing) setTimeout(() => setLoading(false), 500);
    }
  };

  const onRefresh = React.useCallback(() => {
    setLoading(true);
    setRefreshing(true);
    fetchProfile();
  }, []);

  const handleBuyNow = () => {
    // 1. Check if already subscribed to same plan
    if (
      profile?.membership_type?.toUpperCase() === billingCycle.toUpperCase() &&
      new Date(profile?.membership_expiry) > new Date()
    ) {
      showAlert(
        "Already Active",
        `You already have an active ${billingCycle} membership.`,
        "info",
      );
      return;
    }

    // 2. Prevent Downgrade (Yearly -> Monthly)
    if (
      profile?.membership_type?.toUpperCase() === "YEARLY" &&
      billingCycle === "monthly" &&
      new Date(profile?.membership_expiry) > new Date()
    ) {
      showAlert(
        "Downgrade Restricted",
        "You cannot switch to Monthly while you have an active Yearly plan. Please wait for your current plan to expire.",
        "error",
      );
      return;
    }

    initiatePayment();
  };

  const initiatePayment = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showAlert("Error", "You must be logged in to buy a plan.", "error");
        return;
      }

      const amountToPay = billingCycle === "yearly" ? 999 : 99;

      const session = await supabase.auth.getSession();
      const retryHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.data.session?.access_token}`,
      };

      const orderRes = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/razorpay-api`,
        {
          method: "POST",
          headers: retryHeaders,
          body: JSON.stringify({
            action: "create-order",
            data: { amount: amountToPay, currency: "INR" },
          }),
        },
      );

      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.error || "Failed to create order");

      const options = {
        description: `Mudralaya ${billingCycle} Membership`,
        image: "https://mudralaya.com/logo.png",
        currency: "INR",
        key: orderData.keyId,
        amount: amountToPay * 100,
        name: "Mudralaya",
        order_id: orderData.id,
        prefill: {
          email: user.email || "",
          contact: profile?.phone || "",
          name: profile?.full_name || "",
        },
        theme: { color: "#4F46E5" },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          try {
            const verifyRes = await fetch(
              `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/razorpay-api`,
              {
                method: "POST",
                headers: retryHeaders,
                body: JSON.stringify({
                  action: "verify-payment",
                  data: {
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_signature: data.razorpay_signature,
                    type: "membership",
                    userId: user.id,
                    plan: billingCycle,
                    amount: amountToPay,
                  },
                }),
              },
            );

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok)
              throw new Error(verifyData?.error || "Verification failed");

            showAlert(
              "Success",
              "Membership purchased successfully!",
              "success",
              () => {
                fetchProfile(); // Refresh profile to show new status
                handleOpenDrawer();
              },
            );
          } catch (verifyError: any) {
            console.error("Verification Error:", verifyError);
            showAlert(
              "Error",
              verifyError.message || "Verification Failed",
              "error",
            );
          }
        })
        .catch((err: any) => {
          if (err.code !== 2) {
            // err.code === 2 means payment was cancelled by user
            console.error("Payment Error:", err);
            showAlert(
              "Error",
              err.description || err.message || "Payment Failed",
              "error",
            );
          }
        })
        .finally(() => setLoading(false));
    } catch (error: any) {
      showAlert(
        "Error",
        error.message || "Something went wrong initializing payment.",
        "error",
      );
    } finally {
      // setLoading(false); // This setLoading is handled by the RazorpayCheckout promise chain
    }
  };

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const queuedPlanInfo = useMemo(() => {
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
  }, [profile]);

  const price = billingCycle === "yearly" ? 999 : 99;
  const period = billingCycle === "yearly" ? "Year" : "30 Days";

  const isDark = theme === "dark";
  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  const MembershipSkeleton = () => (
    <View style={{ padding: 20, gap: 24 }}>
      {/* Header */}
      <View>
        <Skeleton width={200} height={32} style={{ marginBottom: 10 }} />
        <Skeleton width="100%" height={20} />
      </View>

      {/* Toggles */}
      <Skeleton width="100%" height={56} borderRadius={16} />

      {/* Golden Card */}
      <Skeleton width="100%" height={220} borderRadius={24} />

      {/* Benefits */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="47%" height={150} borderRadius={20} />
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
              Membership
            </Text>
            <View style={{ width: 40 }} />
          </View>
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
          {loading ? (
            <MembershipSkeleton />
          ) : (
            <>
              <View style={styles.pageHeader}>
                <Text style={[styles.title, { color: textColor }]}>
                  Mudralaya Membership
                </Text>
                <Text style={[styles.subtitle, { color: subTextColor }]}>
                  Become our member and Gain these benefits of membership
                </Text>

                <View
                  style={[
                    styles.toggleContainer,
                    { backgroundColor: isDark ? "#1e293b" : "#f4f4f5" },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      billingCycle === "yearly" && [
                        styles.activeToggleBtn,
                        { backgroundColor: isDark ? "#4F46E5" : "#fff" },
                      ],
                    ]}
                    onPress={() => setBillingCycle("yearly")}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        billingCycle === "yearly" && [
                          styles.activeToggleText,
                          { color: isDark ? "#fff" : "#111" },
                        ],
                      ]}
                    >
                      Yearly <Text style={styles.discountBadge}>-20%</Text>
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      billingCycle === "monthly" && [
                        styles.activeToggleBtn,
                        { backgroundColor: isDark ? "#4F46E5" : "#fff" },
                      ],
                    ]}
                    onPress={() => setBillingCycle("monthly")}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        billingCycle === "monthly" && [
                          styles.activeToggleText,
                          { color: isDark ? "#fff" : "#111" },
                        ],
                      ]}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Golden Card */}
              <View style={styles.cardContainer}>
                <LinearGradient
                  colors={["#FFD700", "#DAA520", "#B8860B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.goldenCard}
                >
                  <View style={styles.cardOverlay} />

                  <View style={styles.cardTop}>
                    <View style={styles.chip} />
                    <View style={styles.logoRow}>
                      <Crown color="#fff" size={24} />
                      <Text style={styles.logoText}>Mudralaya</Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.membershipLabel}>GOLD MEMBERSHIP</Text>
                    <Text style={styles.cardNumber}>•••• •••• •••• 8842</Text>
                  </View>

                  <View style={styles.cardBottom}>
                    <View>
                      <Text style={styles.cardLabel}>Member Since</Text>
                      <Text style={styles.cardValue}>
                        {profile?.membership_start_date
                          ? profile.membership_start_date.split(",")[0]
                          : "DD/MM/YY"}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.cardLabel}>Expires</Text>
                      <Text style={styles.cardValue}>
                        {profile?.membership_expiry
                          ? profile.membership_expiry.includes(",")
                            ? profile.membership_expiry.split(",")[0]
                            : profile.membership_expiry.split("T")[0] // Handle ISO fallback
                          : "MM/YY"}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {queuedPlanInfo && (
                  <View style={styles.stackedBadge}>
                    <Sparkles size={14} color="#DAA520" />
                    <Text style={styles.stackedText}>
                      Your {queuedPlanInfo.type} plan will get started in{" "}
                      {queuedPlanInfo.days} days
                    </Text>
                  </View>
                )}
              </View>

              {/* Benefits */}
              <View style={styles.benefitsGrid}>
                {BENEFITS.map((benefit) => (
                  <View
                    key={benefit.id}
                    style={[
                      styles.benefitCard,
                      {
                        backgroundColor: isDark
                          ? "rgba(30, 41, 59, 0.5)"
                          : "rgba(255,255,255,0.6)",
                        borderColor: borderColor,
                      },
                    ]}
                  >
                    <View style={styles.benefitHeader}>
                      <View
                        style={[
                          styles.benefitIdBox,
                          { backgroundColor: isDark ? "#312e81" : "#EEF2FF" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.benefitId,
                            { color: isDark ? "#818cf8" : "#4F46E5" },
                          ]}
                        >
                          {benefit.id}
                        </Text>
                      </View>
                      <CheckCircle2 size={20} color="#10b981" />
                    </View>
                    <Text style={[styles.benefitTitle, { color: textColor }]}>
                      {benefit.title}
                    </Text>
                    <Text style={[styles.benefitDesc, { color: subTextColor }]}>
                      {benefit.desc}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: isDark ? "#1e293b" : "#fff",
              borderTopColor: borderColor,
            },
          ]}
        >
          <View>
            <Text style={[styles.priceAmount, { color: textColor }]}>
              ₹ {price}
            </Text>
            <Text style={[styles.pricePeriod, { color: subTextColor }]}>
              / {period}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.buyBtn,
              { backgroundColor: isDark ? "#4F46E5" : "#111" },
              (profile?.membership_type?.toUpperCase() ===
                billingCycle.toUpperCase() ||
                loading) && { opacity: 0.6 },
            ]}
            onPress={handleBuyNow}
            disabled={
              profile?.membership_type?.toUpperCase() ===
                billingCycle.toUpperCase() ||
              loading ||
              isDowngrade
            }
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.buyBtnText}>
                  {profile?.membership_type?.toUpperCase() ===
                  billingCycle.toUpperCase()
                    ? "ENROLLED"
                    : isDowngrade
                      ? "Downgrade Restricted"
                      : "Buy Now"}
                </Text>
                {profile?.membership_type?.toUpperCase() !==
                  billingCycle.toUpperCase() &&
                  !isDowngrade && <ArrowRight color="#fff" size={20} />}
              </>
            )}
          </TouchableOpacity>
        </View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onClose={closeAlert}
          onConfirm={() => {
            if (alert.onConfirm) alert.onConfirm();
            closeAlert();
          }}
          confirmText={alert.confirmText}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
  pageHeader: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
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
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5", // Light gray background
    borderRadius: 16,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12, // Taller buttons
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  activeToggleBtn: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeToggleText: {
    color: "#333",
    fontWeight: "700",
  },
  discountBadge: {
    color: "#16a34a", // Green for discount
    fontSize: 12,
    fontWeight: "800",
  },
  cardContainer: {
    marginBottom: 42,
  },
  goldenCard: {
    borderRadius: 24,
    padding: 24,
    height: 220,
    justifyContent: "space-between",
  },
  cardOverlay: {
    // Simulate shine/gradient overlay
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chip: {
    width: 50,
    height: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  cardBody: {
    marginTop: 20,
  },
  membershipLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  cardNumber: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "monospace", // Or a mono font if available
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  benefitsGrid: {
    gap: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  benefitCard: {
    width: "47%", // 2 columns roughly
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fff",
  },
  benefitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitIdBox: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  benefitId: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "bold",
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  benefitDesc: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
  },
  pricePeriod: {
    fontSize: 12,
  },
  buyBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buyBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
