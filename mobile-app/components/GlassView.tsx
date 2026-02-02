import React from "react";
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from "react-native";
import { BlurView } from "expo-blur";

interface GlassViewProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  intensity?: number;
  tint?: "light" | "dark" | "default";
}

export const GlassView: React.FC<GlassViewProps> = ({
  style,
  children,
  intensity = 50,
  tint = "light",
}) => {
  const isDark = tint === "dark";
  const defaultBg = isDark
    ? "rgba(15, 23, 42, 0.8)"
    : "rgba(255, 255, 255, 0.65)";
  const androidBg = isDark
    ? "rgba(15, 23, 42, 0.95)"
    : "rgba(255, 255, 255, 0.9)";
  const borderColor = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(255, 255, 255, 0.4)";

  if (Platform.OS === "android") {
    // Android Glassmorphism fallback
    return (
      <View
        style={[
          styles.base,
          { backgroundColor: androidBg, borderColor },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.base, { backgroundColor: defaultBg, borderColor }, style]}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: 1,
  },
});
