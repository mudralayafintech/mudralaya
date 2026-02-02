import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { GlassView } from "./GlassView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/ThemeContext";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInRight,
  FadeOutRight,
  Layout,
  LinearTransition,
  Easing,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

function TabItem({
  route,
  index,
  state,
  descriptors,
  navigation,
  isDark,
}: {
  route: any;
  index: number;
  state: any;
  descriptors: any;
  navigation: any;
  isDark: boolean;
}) {
  const { options } = descriptors[route.key];
  const isFocused = state.index === index;

  // Map route names to display labels
  let label = options.title;
  if (route.name === "index") label = "Home";
  if (route.name === "tasks") label = "Task"; // User requested "Task"
  if (route.name === "wallet") label = "Wallet";

  const onPress = () => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  // Animate padding only
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      paddingHorizontal: isFocused ? 16 : 0, // Reduced from 20 to 16
      // rigid flex structure maintained by parent
    };
  }, [isFocused]);

  // Animate opacity of elements that should appear/disappear
  const animatedOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
    };
  }, [isFocused]);

  const color = isFocused
    ? isDark
      ? "#fff"
      : "#0f172a"
    : isDark
      ? "#94a3b8"
      : "#64748b";

  const Icon = options.tabBarIcon;
  const activeBgColor = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.05)";

  return (
    <View style={styles.tabSlot}>
      <AnimatedTouchableOpacity
        onPress={onPress}
        style={[styles.tabBtn, animatedContainerStyle]}
        layout={LinearTransition.duration(250).easing(
          Easing.inOut(Easing.ease),
        )}
        activeOpacity={0.7}
      >
        {/* Absolute Background Indicator */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: activeBgColor, borderRadius: 20 }, // Reduced radius
            animatedOpacityStyle,
          ]}
        />

        <View style={styles.iconContainer}>
          {Icon && <Icon color={color} size={22} />}
        </View>

        {isFocused && (
          <Animated.View
            style={[styles.labelContainer, animatedOpacityStyle]} // Use opacity instead of entering/exiting
          >
            <Text style={[styles.labelText, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </Animated.View>
        )}
      </AnimatedTouchableOpacity>
    </View>
  );
}

export function GlassTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      <GlassView
        style={[
          styles.glass,
          isDark && {
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            borderColor: "rgba(255,255,255,0.1)",
          },
        ]}
        intensity={80}
        tint={isDark ? "dark" : "light"}
      >
        <View style={styles.content}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            if ((options as any).href === null || route.name === "profile")
              return null;

            return (
              <TabItem
                key={route.key}
                route={route}
                index={index}
                state={state}
                descriptors={descriptors}
                navigation={navigation}
                isDark={isDark}
              />
            );
          })}
        </View>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: "center", // Center the floating tab bar
  },
  glass: {
    borderRadius: 32,
    height: 64,
    width: "100%",
    maxWidth: 400, // Limit width on tablets
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between", // Space evenly
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 8, // Padding for the outer edges
  },
  tabBtn: {
    flexDirection: "row", // Horizontal layout for Icon + Text
    alignItems: "center",
    justifyContent: "center",
    height: 42, // Reduced from 48
    borderRadius: 21, // Pill shape
    overflow: "hidden", // Ensure background stays inside
    // No margin or flex here, controlled by wrapper
  },
  tabSlot: {
    flex: 1, // Each tab takes equal space (1/3rd)
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  labelContainer: {
    marginLeft: 8,
    overflow: "hidden",
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
