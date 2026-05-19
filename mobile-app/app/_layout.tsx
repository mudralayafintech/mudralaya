import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  View,
  ActivityIndicator,
  Text,
  Platform,
  Alert,
} from "react-native";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { ThemeProvider } from "@/lib/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import Constants, { ExecutionEnvironment } from "expo-constants";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

// Detect if running in Expo Go (where push notifications are unsupported since SDK 53)
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configure how notifications are shown when app is in foreground
// Only set handler in development/standalone builds (not Expo Go)
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    } as any),
  });
} else {
  console.log(
    "[Notifications] Running in Expo Go — push notifications are disabled. Use a development build for full support."
  );
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Notification dropdown state
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
  });

  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Skip push notification setup in Expo Go (unsupported since SDK 53)
    if (isExpoGo) {
      console.log("[Notifications] Skipping push notification setup in Expo Go.");
      return;
    }

    // 1. Request Permission
    const requestPermissions = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return;
      }

      console.log("Push notification permission granted:", finalStatus);

      // Get Expo push token for debugging
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        console.log("Expo Push Token:", tokenData.data);
      } catch (e) {
        console.log("Could not get push token:", e);
      }
    };

    requestPermissions();

    // 2. Listen for foreground notifications
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotificationData({
          title: notification.request.content.title || "New Notification",
          message: notification.request.content.body || "",
        });
        setNotificationVisible(true);
      }
    );

    // 3. Listen for notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification tapped:", response.notification.request.content);
      }
    );

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (e) {
        console.error("Session check failed", e);
      } finally {
        setInitialized(true);
        SplashScreen.hideAsync();
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Force initialization after 5 seconds to prevent blank screen
    const timeout = setTimeout(() => {
      setInitialized(true);
      SplashScreen.hideAsync();
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!initialized || !rootNavigationState?.key) return;

    // Protected routes require authentication
    const inProtectedRoute =
      segments[0] === "(drawer)" || segments[0] === "notifications";
    const isPublicRoute =
      segments[0] === "login" ||
      segments[0] === "create-task" ||
      segments[0] === "profile" ||
      !segments[0]; // Root path (landing page)

    if (!session && inProtectedRoute) {
      // Not logged in but on a protected route → send to landing page
      router.replace("/");
    } else if (session && !inProtectedRoute && !isPublicRoute) {
      // Logged in but on unknown route → send to dashboard
      router.replace("/(drawer)/(tabs)");
    } else if (session && isPublicRoute) {
      // Logged in but on landing/login page → send to dashboard
      router.replace("/(drawer)/(tabs)");
    }
  }, [session, initialized, segments, rootNavigationState?.key]);

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Animated.Image
          source={require("../assets/splash-icon.png")}
          style={[
            { width: 200, height: 200, resizeMode: "contain" },
            animatedStyle,
          ]}
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right", // Smooth native-like transition
            animationDuration: 200,
            gestureEnabled: true, // Enable swipe back
            presentation: "card",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="notifications"
            options={{ headerShown: false, presentation: "modal" }}
          />
        </Stack>

        {/* Animated Notification Dropdown */}
        <NotificationDropdown
          visible={notificationVisible}
          title={notificationData.title}
          message={notificationData.message}
          onDismiss={() => setNotificationVisible(false)}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
