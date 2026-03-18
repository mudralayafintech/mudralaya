import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../lib/ThemeContext";

export default function PrivacyPolicy() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const subTextColor = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Privacy Policy</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#4F46E5", "#3b82f6"]}
              style={styles.iconBg}
            >
              <ShieldCheck size={40} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={[styles.title, { color: textColor }]}>Data Privacy Commitment</Text>
          <Text style={[styles.date, { color: subTextColor }]}>Last Updated: March 3, 2026</Text>

          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>1. Information We Collect</Text>
            <Text style={[styles.text, { color: subTextColor }]}>
              Mudralaya collects information necessary for identity verification (KYC) and payment processing, including:{"\n\n"}
              • Full Name and Contact Details{"\n"}
              • Government IDs (PAN, Aadhaar) for financial compliance{"\n"}
              • Bank Account details for reward payouts{"\n"}
              • Device information for security and fraud prevention
            </Text>

            <Text style={[styles.sectionTitle, { color: textColor }]}>2. How We Use Your Data</Text>
            <Text style={[styles.text, { color: subTextColor }]}>
              Your data is used strictly for:{"\n\n"}
              • Verifying your identity as per financial regulations.{"\n"}
              • Processing payments and payouts.{"\n"}
              • Providing task-related updates and support.{"\n"}
              • Improving app security and preventing unauthorized access.
            </Text>

            <Text style={[styles.sectionTitle, { color: textColor }]}>3. Data Security</Text>
            <Text style={[styles.text, { color: subTextColor }]}>
              We implement industry-standard encryption and security protocols to protect your sensitive financial information. Data is stored securely on encrypted servers and is never sold to third parties.
            </Text>

            <Text style={[styles.sectionTitle, { color: textColor }]}>4. Financial Disclosures</Text>
            <Text style={[styles.text, { color: subTextColor }]}>
              Mudralaya is a platform for task-based earnings and financial education. We do not provide loans, and any "salary support" is performance-based as per shared Terms of Service.
            </Text>

            <Text style={[styles.sectionTitle, { color: textColor }]}>5. Contact Us</Text>
            <Text style={[styles.text, { color: subTextColor }]}>
              For privacy concerns, contact our Data Protection Officer at support@mudralaya.com.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollContent: { padding: 20 },
  iconContainer: { alignItems: "center", marginBottom: 20 },
  iconBg: { width: 80, height: 80, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 5 },
  date: { fontSize: 14, textAlign: "center", marginBottom: 30 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  text: { fontSize: 14, lineHeight: 22 },
});
