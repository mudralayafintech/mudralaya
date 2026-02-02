import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Dimensions,
  LayoutAnimation,
  UIManager,
  RefreshControl,
} from "react-native";
import { CustomAlert } from "../../components/CustomAlert";
import { Stack, useRouter, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GlassView } from "../../components/GlassView";
import { LinearGradient } from "expo-linear-gradient";
import {
  Check,
  Menu,
  Star,
  Zap,
  Briefcase,
  Rocket,
  ChevronDown,
  ChevronUp,
  Bell,
} from "lucide-react-native";
import RazorpayCheckout from "react-native-razorpay";
import { DrawerActions } from "@react-navigation/native";
import { supabase } from "../../lib/supabase";
import { useTheme } from "@/lib/ThemeContext";
import { Skeleton } from "../../components/Skeleton";

// Plan interface and constants

interface Plan {
  id: number;
  name: string;
  price: number | "Customise";
  features: string[];
  type: "purple" | "black";
  badgeType: "pill" | "wide";
  hasSeparator?: boolean;
  buttonText: string;
  buttonStyle: "outline" | "cyan" | "black";
  hasCheckbox?: boolean;
  icon: any;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.82;
const CARD_SPACING = 12;
const TOTAL_CARD_WIDTH = CARD_WIDTH + CARD_SPACING * 2;
const INSET_X = (width - TOTAL_CARD_WIDTH) / 2;

const PlanCard = ({
  plan,
  onSelect,
  hasLaptop,
  setHasLaptop,
  currentPlan,
}: {
  plan: Plan;
  onSelect: (p: Plan) => void;
  hasLaptop: boolean;
  setHasLaptop: (v: boolean) => void;
  currentPlan: string | null;
}) => {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const isBlack = plan.type === "black";

  // Colors
  const textColor = isBlack || isDarkMode ? "#fff" : "#1e293b";
  const subTextColor = isBlack || isDarkMode ? "#94a3b8" : "#475569";
  const checkBg =
    isBlack || isDarkMode
      ? "rgba(34, 211, 238, 0.15)"
      : "rgba(79, 70, 229, 0.1)";
  const checkColor = isBlack || isDarkMode ? "#22d3ee" : "#4f46e5";
  const separatorColor =
    isBlack || isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  // Determine displayed features. Show 4 by default.
  // Exception: If total features are <= 5, just show all to avoid a button for 1 item.
  const shouldTruncate = plan.features.length > 5;
  const visibleFeatures =
    shouldTruncate && !expanded ? plan.features.slice(0, 4) : plan.features;

  const BackgroundComponent = isBlack ? (
    <LinearGradient
      colors={["#0f172a", "#020617"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  ) : (
    <LinearGradient
      colors={isDarkMode ? ["#1e293b", "#0f172a"] : ["#ffffff", "#f8fafc"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );

  const renderBadge = () => (
    <View
      style={[
        styles.badge,
        isBlack ? styles.badgeBlack : styles.badgePurple,
        plan.badgeType === "pill" ? styles.badgePill : styles.badgeWide,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          isBlack ? styles.badgeTextBlack : styles.badgeTextPurple,
        ]}
      >
        {plan.name}
      </Text>
    </View>
  );

  const renderPrice = () => {
    const priceSubColor = isBlack ? "rgba(255,255,255,0.6)" : "#64748b";

    if (plan.price === "Customise") {
      return (
        <View style={styles.priceContainer}>
          <Text style={[styles.currency, { color: priceSubColor }]}>₹</Text>
          <Text style={[styles.priceValue, { color: textColor }]}>
            Customise
          </Text>
        </View>
      );
    }

    let displayPrice = plan.price;
    if (plan.id === 2 && hasLaptop) displayPrice = 5000;

    return (
      <View style={styles.priceContainer}>
        <Text style={[styles.currency, { color: priceSubColor }]}>₹</Text>
        <Text style={[styles.priceValue, { color: textColor }]}>
          {displayPrice === 0 ? "0" : displayPrice.toLocaleString()}
        </Text>
        {plan.id === 1 && (
          <Text style={[styles.period, { color: priceSubColor }]}>
            / lifetime
          </Text>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.cardWrapper,
        isBlack || isDarkMode
          ? styles.cardShadowBlack
          : styles.cardShadowPurple,
        { width: CARD_WIDTH, marginHorizontal: CARD_SPACING },
      ]}
    >
      {BackgroundComponent}
      {!isBlack && (
        <LinearGradient
          colors={["rgba(79, 70, 229, 0.03)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            {plan.icon && (
              <plan.icon size={24} color={isBlack ? "#22d3ee" : "#4f46e5"} />
            )}
          </View>
          {renderBadge()}
        </View>

        {renderPrice()}

        <View style={styles.featuresList}>
          {visibleFeatures.map((feature, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.checkIcon, { backgroundColor: checkBg }]}>
                <Check size={12} color={checkColor} strokeWidth={3} />
              </View>
              <Text style={[styles.featureText, { color: subTextColor }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {shouldTruncate && (
          <TouchableOpacity onPress={toggleExpand} style={styles.readMoreBtn}>
            <Text style={[styles.readMoreText, { color: subTextColor }]}>
              {expanded ? "Show Less" : "Read More"}
            </Text>
            {expanded ? (
              <ChevronUp size={16} color={subTextColor} />
            ) : (
              <ChevronDown size={16} color={subTextColor} />
            )}
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />

        {plan.hasCheckbox && (
          <View style={styles.checkboxSection}>
            <View
              style={[styles.separator, { backgroundColor: separatorColor }]}
            />
            <TouchableOpacity
              style={[
                styles.checkboxRow,
                plan.name === "INDIVIDUAL" &&
                  currentPlan === "INDIVIDUAL" && {
                    opacity: 0.7,
                  },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                if (plan.name === "INDIVIDUAL" && currentPlan === "INDIVIDUAL")
                  return;
                setHasLaptop(!hasLaptop);
              }}
              disabled={
                plan.name === "INDIVIDUAL" && currentPlan === "INDIVIDUAL"
              }
            >
              <Switch
                value={hasLaptop}
                onValueChange={(val) => {
                  if (
                    plan.name === "INDIVIDUAL" &&
                    currentPlan === "INDIVIDUAL"
                  )
                    return;
                  setHasLaptop(val);
                }}
                disabled={
                  plan.name === "INDIVIDUAL" && currentPlan === "INDIVIDUAL"
                }
                trackColor={{ false: "#334155", true: "#22d3ee" }}
                thumbColor="#fff"
                ios_backgroundColor="#334155"
              />
              <Text style={[styles.checkboxLabel, { color: textColor }]}>
                I have my Own Laptop
              </Text>
            </TouchableOpacity>
            <View
              style={[styles.separator, { backgroundColor: separatorColor }]}
            />
          </View>
        )}

        {/* Separator if needed (mostly replaced by logic above, but keeping for bottom buttons) */}
        {plan.hasSeparator && !plan.hasCheckbox && (
          <View
            style={[
              styles.separator,
              { marginBottom: 20, backgroundColor: separatorColor },
            ]}
          />
        )}

        <TouchableOpacity
          style={[
            styles.actionBtn,
            plan.buttonStyle === "outline" && styles.btnOutline,
            plan.buttonStyle === "cyan" && styles.btnCyan,
            plan.buttonStyle === "black" && styles.btnBlack,
            (plan.id === 1 ||
              (plan.name === "INDIVIDUAL" && currentPlan === "INDIVIDUAL")) && {
              opacity: 0.6,
            },
          ]}
          onPress={() => onSelect(plan)}
          disabled={
            plan.id === 1 ||
            (plan.name === "INDIVIDUAL" && currentPlan === "INDIVIDUAL")
          }
        >
          <Text
            style={[
              styles.btnText,
              plan.buttonStyle === "outline" && styles.btnTextOutline,
              plan.buttonStyle === "cyan" && styles.btnTextCyan,
              plan.buttonStyle === "black" && styles.btnTextBlack,
            ]}
          >
            {plan.buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function PlansScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "#f1f5f9" : "#333";
  const subTextColor = isDark ? "#94a3b8" : "#666";
  const dotColor = isDark ? "#475569" : "#cbd5e1";
  const activeDotColor = isDark ? "#818cf8" : "#4f46e5";

  const PlansSkeleton = () => (
    <View style={{ padding: 20 }}>
      {/* Header Text */}
      <View style={{ marginBottom: 30 }}>
        <Skeleton width={200} height={30} style={{ marginBottom: 10 }} />
        <Skeleton width="90%" height={20} />
      </View>

      {/* Plan Card Skeleton */}
      <View style={{ alignItems: "center" }}>
        <Skeleton width={CARD_WIDTH} height={500} borderRadius={24} />
      </View>

      {/* Pagination Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginTop: 24,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width={8} height={8} borderRadius={4} />
        ))}
      </View>
    </View>
  );

  const [hasLaptop, setHasLaptop] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserStatus();
  }, []);

  const fetchUserStatus = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("plan_type, has_laptop")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user status:", error);
        return;
      }

      if (data) {
        setCurrentPlan(data.plan_type);
        setHasLaptop(!!data.has_laptop);
      }
    } catch (err) {
      console.error("Fetch Status Exception:", err);
    } finally {
      if (!refreshing) setLoading(false);
      setRefreshing(false);
      if (refreshing) setTimeout(() => setLoading(false), 500);
    }
  };

  const onRefresh = React.useCallback(() => {
    setLoading(true);
    setRefreshing(true);
    fetchUserStatus();
  }, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "info" | "success" | "error" | "confirm",
    onConfirm: undefined as (() => void) | undefined,
    confirmText: "OK",
  });

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

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.id === 1) return;

    if (plan.id === 2) {
      const finalAmount = hasLaptop ? 5000 : 25000;
      initiatePayment(plan, finalAmount);
    } else {
      showAlert(
        "Contact Sales",
        `For ${plan.name}, please contact our sales team at support@mudralaya.com for a customized quote.`,
        "info",
      );
    }
  };

  const initiatePayment = async (plan: Plan, amount: number) => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        showAlert(
          "Error",
          "You must be logged in to purchase a plan.",
          "error",
        );
        return;
      }

      console.log("Initializing payment with raw fetch...");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session status:", session ? "Authenticated" : "Anonymous");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ""}`,
        apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
      };

      console.log("Requesting order creation anonymously...");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/razorpay-api`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            action: "create-order",
            data: {
              amount: amount,
              currency: "INR",
              receipt: `plan_ind_${Date.now()}`,
            },
          }),
        },
      );

      const orderData = await response.json();
      console.log("Raw Create Order Response:", {
        status: response.status,
        data: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error(
          orderData?.error ||
            orderData?.message ||
            `Server Error: ${response.status}`,
        );
      }

      const options = {
        name: "Mudralaya Fintech",
        description: `Purchase ${plan.name} Plan`,
        image: "https://mudralaya.com/logo.png",
        currency: orderData.currency,
        key: orderData.keyId || "",
        amount: orderData.amount,
        order_id: orderData.id,
        prefill: {
          email: user.email || "",
          contact: user.phone || "",
          name: user.user_metadata?.full_name || "",
        },
        theme: { color: "#4f46e5" },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          try {
            const {
              data: { session: verifySession },
            } = await supabase.auth.getSession();

            const verifyHeaders: Record<string, string> = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ""}`,
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
            };

            const verifyRes = await fetch(
              `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/razorpay-api`,
              {
                method: "POST",
                headers: verifyHeaders,
                body: JSON.stringify({
                  action: "verify-payment",
                  data: {
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_signature: data.razorpay_signature,
                    type: "plan",
                    userId: user.id,
                    plan: "individual",
                    amount: amount,
                    hasLaptop: hasLaptop,
                  },
                }),
              },
            );

            const verifyData = await verifyRes.json();
            console.log("Raw Verify Payment Response:", {
              status: verifyRes.status,
              data: verifyData,
            });

            if (!verifyRes.ok)
              throw new Error(verifyData?.error || "Verification failed");
            showAlert(
              "Success",
              "Plan purchased successfully!",
              "success",
              () => {
                fetchUserStatus();
                handleOpenDrawer();
              },
            );
          } catch (verifyErr: any) {
            showAlert(
              "Verification Failed",
              verifyErr.message || "Payment verification failed",
              "error",
            );
          }
        })
        .catch((error: any) => {
          if (error.code && error.description) {
            showAlert(
              "Payment Failed",
              `${error.description} (Code: ${error.code})`,
              "error",
            );
          } else {
            console.log("Payment canceled", error);
          }
        });
    } catch (error: any) {
      showAlert(
        "Error",
        error.message || "Something went wrong initializing payment.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const plans: Plan[] = [
    {
      id: 1,
      name: "FREE",
      price: 0,
      features: [
        "Start with zero investment",
        "Access to daily / weekly / monthly tasks",
        "Earn by completing tasks from multiple companies",
        "Flexible work — home or on-field",
        "Unlimited earning potential",
        "Simple onboarding (18+)",
        "Ideal for students, homemakers & part-time earners",
      ],
      type: "purple",
      badgeType: "pill",
      hasSeparator: true,
      buttonText: currentPlan === "FREE" ? "ENROLLED" : "CHOOSE PLAN",
      buttonStyle: "outline",
      icon: Zap,
    },
    {
      id: 2,
      name: "INDIVIDUAL",
      price: 25000,
      features: [
        "Maximum task opportunities from top brands & companies",
        "Weekly training sessions",
        "Dedicated Relationship Manager for guidance",
        "Daily review & performance improvement",
        "Fix salary support up to ₹50,000 (performance-based)",
        "Strong digital presence setup",
        "Priority access to high-paying tasks",
        "Fast-track growth to Skilled Partner + Entrepreneur",
        "Up to 25% more discount on referral",
      ],
      type: "black",
      badgeType: "wide",
      hasCheckbox: true,
      buttonText: currentPlan === "INDIVIDUAL" ? "ENROLLED" : "CHOOSE PLAN",
      buttonStyle: "cyan",
      icon: Star,
    },
    {
      id: 3,
      name: "BUSINESS SOLUTION",
      price: 0,
      features: [
        "We understand your goals and create custom tasks.",
        "Industry-specific tasks for leads, marketing, and outreach.",
        "Training videos for easy execution.",
        "Verified partners for surveys and follow-ups.",
        "Tech, sales, and service support included.",
        "Affordable, scalable solutions for every business.",
      ],
      type: "purple",
      badgeType: "wide",
      hasSeparator: true,
      buttonText: "CHOOSE PLAN",
      buttonStyle: "black",
      icon: Briefcase,
    },
    {
      id: 4,
      name: "STARTUP LAUNCH LAB",
      price: "Customise",
      features: [
        "Understand your idea and build a tailored business model.",
        "Market research and competitor analysis included.",
        "Branding, tech development, and website/app setup.",
        "Support across ideation, strategy, product, and marketing.",
        "Go-to-market execution with dedicated startup mentor.",
        "End-to-end guidance from idea to launch.",
      ],
      type: "purple",
      badgeType: "wide",
      hasSeparator: true,
      buttonText: "CHOOSE PLAN",
      buttonStyle: "black",
      icon: Rocket,
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.stickyHeader,
            { backgroundColor: "transparent", borderBottomWidth: 0 },
          ]}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={handleOpenDrawer}
              style={[
                styles.backButton,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <Menu size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              Mudralaya Plans
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Background Gradient */}
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={isDark ? ["#0f172a", "#1e1b4b"] : ["#fff", "#f0f9ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4f46e5"
            />
          }
        >
          {loading ? (
            <PlansSkeleton />
          ) : (
            <>
              <View style={styles.pageHeader}>
                <Text style={[styles.title, { color: textColor }]}>
                  Mudralaya Plans
                </Text>
                <Text style={[styles.subtitle, { color: subTextColor }]}>
                  Choose the best plan for yourself and start your journey with
                  Mudralaya
                </Text>
              </View>

              <ScrollView
                horizontal
                pagingEnabled={false}
                snapToInterval={CARD_WIDTH + CARD_SPACING * 2}
                snapToAlignment="center"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const x = e.nativeEvent.contentOffset.x;
                  const index = Math.round(x / (CARD_WIDTH + CARD_SPACING * 2));
                  setActiveIndex(index);
                }}
                scrollEventThrottle={16}
                contentContainerStyle={{
                  paddingHorizontal:
                    (width - CARD_WIDTH - CARD_SPACING * 2) / 2,
                  alignItems: "flex-start",
                }}
              >
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onSelect={handlePlanSelect}
                    hasLaptop={hasLaptop}
                    setHasLaptop={setHasLaptop}
                    currentPlan={currentPlan}
                  />
                ))}
              </ScrollView>

              {/* Pagination Dots */}
              <View style={styles.pagination}>
                {plans.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          activeIndex === i ? activeDotColor : dotColor,
                      },
                      activeIndex === i ? styles.activeDot : null,
                    ]}
                  />
                ))}
              </View>
            </>
          )}

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
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stickyHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 10,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  pageHeader: {
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: "hidden",
    // Removed fixed height and maxHeight to allow growth
    marginBottom: 8, // Little spacing for shadow visibility at bottom if needed
  },
  cardShadowPurple: {
    backgroundColor: "#fff",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  cardShadowBlack: {
    backgroundColor: "#0f172a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 0, // Removed border
    borderColor: "transparent",
  },
  cardContent: {
    padding: 24,
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePill: { borderRadius: 20 },
  badgeWide: { borderRadius: 8 },
  badgePurple: { backgroundColor: "#eef2ff" },
  badgeBlack: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgeTextPurple: { color: "#4f46e5" },
  badgeTextBlack: { color: "#fff" },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  currency: {
    fontSize: 20,
    fontWeight: "600",
    marginRight: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
  },
  period: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: "500",
  },
  featuresList: {
    gap: 12,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "500",
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  checkboxSection: {
    marginBottom: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    marginTop: "auto",
  },
  btnOutline: {
    borderColor: "#e2e8f0",
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  btnCyan: {
    backgroundColor: "#22d3ee",
    shadowColor: "#22d3ee",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  btnBlack: {
    backgroundColor: "#0f172a",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  btnText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  btnTextOutline: { color: "#64748b" },
  btnTextCyan: { color: "#0f172a" },
  btnTextBlack: {
    color: "#fff",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
  },
  activeDot: {
    width: 20,
    backgroundColor: "#4f46e5",
  },
});
