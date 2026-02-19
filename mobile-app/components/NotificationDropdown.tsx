import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from "react-native";

const { width } = Dimensions.get("window");

interface NotificationDropdownProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  icon?: string;
}

const THEMES = {
  dark: {
    background: "#1e293b",
    title: "#ffffff",
    message: "#94a3b8",
    iconBg: "rgba(59, 130, 246, 0.2)",
    border: "rgba(59, 130, 246, 0.3)",
    close: "#64748b",
  },
  light: {
    background: "#ffffff",
    title: "#1e293b",
    message: "#64748b",
    iconBg: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.2)",
    close: "#94a3b8",
  },
};

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  visible,
  title,
  message,
  onDismiss,
  icon = "🔔",
}) => {
  // Using light theme to match app design
  const theme = THEMES.light;

  const slideAnim = useRef(new Animated.Value(-200)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Water drop animation sequence
      Animated.sequence([
        // Initial drop (positioned lower)
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 80,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Small bounce (settled lower position)
        Animated.spring(slideAnim, {
          toValue: 70,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      hideNotification();
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideNotification}
        style={[
          styles.card,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: theme.title }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={[styles.message, { color: theme.message }]}
            numberOfLines={2}
          >
            {message}
          </Text>
        </View>

        {/* Close indicator */}
        <View style={styles.closeIndicator}>
          <Text style={[styles.closeText, { color: theme.close }]}>×</Text>
        </View>
      </TouchableOpacity>

      {/* Shadow bottom */}
      <View style={styles.shadow} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
  },
  card: {
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeIndicator: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 28,
    fontWeight: "300",
  },
  shadow: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 16,
    marginTop: -2,
    marginHorizontal: 8,
  },
});
