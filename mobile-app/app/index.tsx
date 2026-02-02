import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function LandingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Background with Gradient or Solid Color */}
      <View style={styles.background} />

      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          {/* Logo Placeholder */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/icon.png")}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.title}>Mudralaya</Text>
          <Text style={styles.subtitle}>
            Your secure financial dashboard and task manager.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.buttons}
        >
          <TouchableOpacity
            style={[styles.btn, styles.primaryBtn]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.primaryBtnText}>Become a Partner</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.secondaryBtn]}
            onPress={() => router.push("/create-task")}
          >
            <Text style={styles.secondaryBtnText}>Have a Task</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    paddingBottom: 60,
  },
  header: {
    alignItems: "center",
    marginTop: 100,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden", // Ensure image stays inside rounded corners
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  buttons: {
    gap: 16,
  },
  btn: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryBtnText: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "600",
  },
});
