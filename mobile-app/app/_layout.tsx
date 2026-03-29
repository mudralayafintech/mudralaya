import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  View,
  ActivityIndicator,
  Text,
  Platform,
  PermissionsAndroid,
  Alert,
} from "react-native";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { ThemeProvider } from "@/lib/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import messaging from "@react-native-firebase/messaging";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

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
    // 1. Request Permission
    const requestUserPermission = async () => {
      if (Platform.OS === "android" && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("Authorization status:", authStatus);
        // 2. Subscribe to general topic
        messaging()
          .subscribeToTopic("all_users")
          .then(() => {
            console.log("Subscribed to all_users topic!");
            // Alert.alert('Subscribed', 'Connected to notifications channel');
          })
          .catch((e) => console.error("Subscription failed", e));
      }
    };

    requestUserPermission();

    // Debug: Log FCM status (removed alert)
    const checkDebug = async () => {
      const authStatus = await messaging().hasPermission();
      console.log("FCM Debug: Auth Status", authStatus);

      const token = await messaging().getToken();
      console.log("FCM Debug: Token", token);
    };
    checkDebug();

    // 3. Listen for foreground messages
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      // Show custom animated dropdown
      setNotificationData({
        title: remoteMessage.notification?.title || "New Notification",
        message: remoteMessage.notification?.body || "",
      });
      setNotificationVisible(true);
    });

    return unsubscribe;
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

    // Check if in auth group
    const inAuthGroup =
      segments[0] === "(drawer)" || segments[0] === "notifications";
    const isPublicRoute =
      segments[0] === "login" ||
      segments[0] === "create-task" ||
      !segments[0]; // Root path

    if (session && !inAuthGroup) {
      router.replace("/(drawer)/(tabs)");
    } else if (!session && !isPublicRoute) {
      router.replace("/"); // Redirect to Landing Page
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
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen
            name="notifications"
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="+not-found"
            options={{ title: "Oops!", headerShown: true }}
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
