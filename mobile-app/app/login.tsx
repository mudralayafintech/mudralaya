import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { ArrowRight, Lock, Phone, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "@/components/GlassView";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendAttempts, setResendAttempts] = useState(0);

  const router = useRouter();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  async function handleSendOtp() {
    setLoading(true);
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+91" + formattedPhone;
    }

    if (formattedPhone.replace("+91", "").length !== 10) {
      Alert.alert(
        "Invalid Number",
        "Please enter a valid 10-digit phone number.",
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
    } else {
      setPhone(formattedPhone);
      setStep("otp");
      setTimer(60);
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      Alert.alert("Error", error.message);
      setLoading(false);
    } else {
      router.replace("/(drawer)/(tabs)");
    }
  }

  async function handleResendOtp() {
    if (resendAttempts >= 3) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setTimer(60);
      setResendAttempts((prev) => prev + 1);
      Alert.alert("OTP Resent", "Please check your messages.");
    }
    setLoading(false);
  }

  const handleChangePhoneNumber = () => {
    setStep("phone");
    setOtp("");
    setTimer(60);
    setResendAttempts(0);

    if (phone.startsWith("+91")) {
      setPhone(phone.replace("+91", ""));
    }
  };

  return (
    <LinearGradient
      colors={["#f8fafc", "#e0f2fe", "#bae6fd"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.springify().damping(15)}
            style={styles.cardContainer}
          >
            <GlassView intensity={60} tint="light" style={styles.glassCard}>
              <View style={styles.logoContainer}>
                <Animated.Image
                  source={require("../assets/splash-icon.png")}
                  style={[styles.logo, animatedLogoStyle]}
                />
                <Text style={styles.appName}>Mudralaya</Text>
              </View>

              <Text style={styles.title}>
                {step === "phone" ? "Welcome Back" : "Verify OTP"}
              </Text>
              <Text style={styles.subtitle}>
                {step === "phone"
                  ? "Access your secure financial dashboard"
                  : `Enter the code sent to ${phone}`}
              </Text>

              <View style={styles.form}>
                {step === "phone" ? (
                  <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Phone Number</Text>
                      <View style={styles.phoneInputWrapper}>
                        <View style={styles.prefixContainer}>
                          <Text style={styles.prefixText}>+91</Text>
                        </View>
                        <TextInput
                          style={styles.phoneInput}
                          onChangeText={(text) =>
                            setPhone(text.replace(/\D/g, ""))
                          }
                          value={phone.replace("+91", "")}
                          placeholder="Enter 10-digit number"
                          placeholderTextColor="#94a3b8"
                          keyboardType="phone-pad"
                          maxLength={10}
                          editable={!loading}
                          cursorColor="#06b6d4"
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.button,
                        (loading || phone.replace("+91", "").length !== 10) &&
                          styles.buttonDisabled,
                      ]}
                      onPress={handleSendOtp}
                      disabled={
                        loading || phone.replace("+91", "").length !== 10
                      }
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <LinearGradient
                          colors={["#06b6d4", "#0891b2"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.gradientButton}
                        >
                          <Text style={styles.buttonText}>Get OTP</Text>
                          <ArrowRight size={20} color="#fff" />
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>One-Time Password</Text>
                      <View style={styles.inputWrapper}>
                        <Lock
                          size={20}
                          color="#64748b"
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.inputWithIcon}
                          onChangeText={(text) => setOtp(text)}
                          value={otp}
                          keyboardType="number-pad"
                          placeholder="Enter 6-digit OTP"
                          placeholderTextColor="#94a3b8"
                          editable={!loading}
                          cursorColor="#06b6d4"
                          autoFocus
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.button, loading && styles.buttonDisabled]}
                      onPress={handleVerifyOtp}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <LinearGradient
                          colors={["#06b6d4", "#0891b2"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.gradientButton}
                        >
                          <Text style={styles.buttonText}>Verify Access</Text>
                          <ChevronRight size={20} color="#fff" />
                        </LinearGradient>
                      )}
                    </TouchableOpacity>

                    <View style={styles.otpActions}>
                      {timer > 0 ? (
                        <Text style={styles.timerText}>Resend in {timer}s</Text>
                      ) : (
                        <TouchableOpacity
                          onPress={handleResendOtp}
                          disabled={loading || resendAttempts >= 3}
                        >
                          <Text
                            style={[
                              styles.linkText,
                              resendAttempts >= 3 && styles.disabledLink,
                            ]}
                          >
                            {resendAttempts >= 3
                              ? "Max attempts reached"
                              : "Resend Code"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={handleChangePhoneNumber}
                      style={styles.changePhoneBtn}
                      disabled={loading}
                    >
                      <Text style={styles.secondaryLinkText}>
                        Change Number
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            </GlassView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  cardContainer: {
    width: "100%",
  },
  glassCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 1)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 8,
    fontWeight: "600",
    marginLeft: 4,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    height: 56,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    overflow: "hidden",
  },
  prefixContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    borderRightWidth: 1,
    borderRightColor: "#cbd5e1",
    backgroundColor: "#e2e8f0",
  },
  prefixText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 18,
    color: "#0f172a",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithIcon: {
    flex: 1,
    fontSize: 18,
    height: "100%",
    color: "#0f172a",
    fontWeight: "500",
    letterSpacing: 2,
  },
  button: {
    height: 56,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  gradientButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  otpActions: {
    marginTop: 24,
    alignItems: "center",
  },
  timerText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  linkText: {
    color: "#06b6d4",
    fontWeight: "600",
    fontSize: 15,
  },
  disabledLink: {
    color: "#cbd5e1",
  },
  changePhoneBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  secondaryLinkText: {
    color: "#64748b",
    fontSize: 14,
  },
});
