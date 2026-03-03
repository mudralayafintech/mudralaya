import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Info, MapPin, Mail, Phone, Globe } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../lib/ThemeContext";

export default function AboutUs() {
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
                    <Text style={[styles.headerTitle, { color: textColor }]}>About Us</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={["#4F46E5", "#3b82f6"]}
                            style={styles.iconBg}
                        >
                            <Info size={40} color="#fff" />
                        </LinearGradient>
                    </View>

                    <Text style={[styles.title, { color: textColor }]}>Mudralaya Fintech</Text>
                    <Text style={[styles.tagline, { color: subTextColor }]}>Empowering Financial Independence</Text>

                    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Our Mission</Text>
                        <Text style={[styles.text, { color: subTextColor }]}>
                            At Mudralaya, our mission is to empower individuals by providing a platform for skill-based earnings, financial literacy, and entrepreneurship. We believe in creating opportunities that help our partners achieve financial freedom through a transparent and secure ecosystem.
                        </Text>

                        <Text style={[styles.sectionTitle, { color: textColor }]}>Company Information</Text>

                        <View style={styles.contactItem}>
                            <View style={[styles.contactIconBg, { backgroundColor: isDark ? "rgba(79, 70, 229, 0.2)" : "#EEF2FF" }]}>
                                <MapPin size={20} color="#4F46E5" />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.contactLabel, { color: textColor }]}>Office Address</Text>
                                <Text style={[styles.contactValue, { color: subTextColor }]}>
                                    Mudralaya Fintech Private Limited{"\n"}
                                    (Registered Office Address Placeholder,{"\n"}
                                    India)
                                </Text>
                            </View>
                        </View>

                        <View style={styles.contactItem}>
                            <View style={[styles.contactIconBg, { backgroundColor: isDark ? "rgba(79, 70, 229, 0.2)" : "#EEF2FF" }]}>
                                <Mail size={20} color="#4F46E5" />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.contactLabel, { color: textColor }]}>Support Email</Text>
                                <Text style={[styles.contactValue, { color: subTextColor }]}>support@mudralaya.com</Text>
                            </View>
                        </View>

                        <View style={styles.contactItem}>
                            <View style={[styles.contactIconBg, { backgroundColor: isDark ? "rgba(79, 70, 229, 0.2)" : "#EEF2FF" }]}>
                                <Phone size={20} color="#4F46E5" />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.contactLabel, { color: textColor }]}>Contact Number</Text>
                                <Text style={[styles.contactValue, { color: subTextColor }]}>+91 (Phone Placeholder)</Text>
                            </View>
                        </View>

                        <View style={styles.contactItem}>
                            <View style={[styles.contactIconBg, { backgroundColor: isDark ? "rgba(79, 70, 229, 0.2)" : "#EEF2FF" }]}>
                                <Globe size={20} color="#4F46E5" />
                            </View>
                            <View style={styles.contactText}>
                                <Text style={[styles.contactLabel, { color: textColor }]}>Website</Text>
                                <Text style={[styles.contactValue, { color: subTextColor }]}>www.mudralaya.com</Text>
                            </View>
                        </View>
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
    tagline: { fontSize: 14, textAlign: "center", marginBottom: 30 },
    card: { padding: 20, borderRadius: 24, borderWidth: 1 },
    sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 10, marginBottom: 15 },
    text: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
    contactItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 20, gap: 15 },
    contactIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    contactText: { flex: 1 },
    contactLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", marginBottom: 2 },
    contactValue: { fontSize: 14, lineHeight: 20 },
});
