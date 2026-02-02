import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/lib/ThemeContext";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number; // Defaults to 12
  variant?: "box" | "circle"; // Defaults to box
  style?: ViewStyle;
}

export const Skeleton = ({
  width = "100%",
  height = 20,
  borderRadius = 12,
  variant = "box",
  style,
}: SkeletonProps) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.ease }),
        withTiming(0.3, { duration: 1000, easing: Easing.ease }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const backgroundColor = theme === "dark" ? "#334155" : "#cbd5e1";

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          backgroundColor,
          borderRadius:
            variant === "circle"
              ? typeof height === "number"
                ? height / 2
                : borderRadius
              : borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};
