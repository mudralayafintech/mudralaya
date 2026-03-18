import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, FileText } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../lib/ThemeContext";

export default function TermsConditions() {
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
                    <Text style={[styles.headerTitle, { color: textColor }]}>Terms & Conditions</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={["#4F46E5", "#3b82f6"]}
                            style={styles.iconBg}
                        >
                            <FileText size={40} color="#fff" />
                        </LinearGradient>
                    </View>

                    <Text style={[styles.title, { color: textColor }]}>User Agreement</Text>
                    <Text style={[styles.date, { color: subTextColor }]}>Last Updated: March 3, 2026</Text>

                    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>1. Acceptance of Terms</Text>
                        <Text style={[styles.text, { color: subTextColor }]}>
                            By accessing or using the Mudralaya app, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the services.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: textColor }]}>2. Eligibility</Text>
                        <Text style={[styles.text, { color: subTextColor }]}>
                            You must be at least 18 years of age to use this app. Users are required to undergo standard identity verification (KYC) to access financial tasks and receive payouts.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: textColor }]}>3. Task-Based Earnings</Text>
                        <Text style={[styles.text, { color: subTextColor }]}>
                            Earnings on Mudralaya are performance-based. Mudralaya provides the platform to connect users with tasks. Completion of tasks does not guarantee "salary" unless explicitly stated in a verified employment contract.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: textColor }]}>4. Fees and Payments</Text>
                        <Text style={[styles.text, { color: subTextColor }]}>
                            Some plans require a one-time enrollment fee. Fees are clearly displayed before purchase. All transactions are processed via secure payment gateways (e.g., Razorpay). Enrollment fees are non-refundable except where required by law.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: textColor }]}>5. Limitation of Liability</Text>
                        <Text style={[styles.text, { color: subTextColor }]}>
                            Mudralaya is not responsible for any indirect, incidental, or consequential damages arising from the use of the app or participation in tasks.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: textColor }]}>6. Termination</Text>
                        <Text style={[styles.text, { color: subTextColor }]}>
                            We reserve the right to suspend or terminate accounts that violate these terms, engage in fraud, or provide false KYC information.
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
