import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  Layout,
  LinearTransition,
} from "react-native-reanimated";
import { ArrowLeft, ArrowRight, Check } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

const STEPS = [
  "Basic Info",
  "Rewards",
  "Details",
  "Media links",
  "Target Audience",
];

export default function CreateTaskPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward_member: "",
    reward_free: "",
    icon_type: "",
    frequency: "",
    video_url: "",
    pdf_url: "",
    action_link: "",
    target_audience: "All", // Simplified for now (can be parsed to array later)
  });

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      Alert.alert("Error", "Title is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("tasks").insert({
        title: formData.title,
        description: formData.description,
        reward_member: parseFloat(formData.reward_member) || 0,
        reward_free: parseFloat(formData.reward_free) || 0,
        icon_type: formData.icon_type,
        frequency: formData.frequency,
        video_url: formData.video_url,
        pdf_url: formData.pdf_url,
        action_link: formData.action_link,
        target_audience: [formData.target_audience], // Format as array
        is_active: true,
        task_type: "Daily", // Default to Daily
      });

      if (error) throw error;

      Alert.alert("Success", "Task created successfully!", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's the task?</Text>
            <Input
              label="Task Title *"
              value={formData.title}
              onChangeText={(t) => updateField("title", t)}
              placeholder="e.g., Watch Intro Video"
            />
            <Input
              label="Description"
              value={formData.description}
              onChangeText={(t) => updateField("description", t)}
              placeholder="Describe what users need to do..."
              multiline
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Set Rewards</Text>
            <Input
              label="Reward for Members"
              value={formData.reward_member}
              onChangeText={(t) => updateField("reward_member", t)}
              placeholder="0.00"
              keyboardType="numeric"
            />
            <Input
              label="Reward for Free Users"
              value={formData.reward_free}
              onChangeText={(t) => updateField("reward_free", t)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Task Details</Text>
            <Input
              label="Icon Type"
              value={formData.icon_type}
              onChangeText={(t) => updateField("icon_type", t)}
              placeholder="e.g., play-circle, document"
            />
            <Input
              label="Frequency"
              value={formData.frequency}
              onChangeText={(t) => updateField("frequency", t)}
              placeholder="e.g., Daily, One-time"
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Media Links</Text>
            <Input
              label="Video URL"
              value={formData.video_url}
              onChangeText={(t) => updateField("video_url", t)}
              placeholder="https://..."
            />
            <Input
              label="PDF URL"
              value={formData.pdf_url}
              onChangeText={(t) => updateField("pdf_url", t)}
              placeholder="https://..."
            />
            <Input
              label="Action Link"
              value={formData.action_link}
              onChangeText={(t) => updateField("action_link", t)}
              placeholder="https://..."
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Target Audience</Text>
            <Input
              label="Target Audience"
              value={formData.target_audience}
              onChangeText={(t) => updateField("target_audience", t)}
              placeholder="Default: All"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${((currentStep + 1) / STEPS.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.stepCounter}>
          {currentStep + 1}/{STEPS.length}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View
            key={`step-${currentStep}`}
            entering={FadeInRight} // Smooth fade in from right
            exiting={FadeOutLeft} // Smooth fade out to left
            layout={LinearTransition}
          >
            {renderStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.nextBtnText}>
            {loading
              ? "Saving..."
              : currentStep === STEPS.length - 1
                ? "Create Task"
                : "Next"}
          </Text>
          {!loading &&
            (currentStep === STEPS.length - 1 ? (
              <Check size={20} color="#fff" />
            ) : (
              <ArrowRight size={20} color="#fff" />
            ))}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2563eb",
  },
  stepCounter: {
    color: "#64748b",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 24,
  },
  stepContent: {
    gap: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    color: "#0f172a",
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  nextBtn: {
    backgroundColor: "#2563eb",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
