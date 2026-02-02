import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { ThemeProvider } from "@/lib/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
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

  const rootNavigationState = useRootNavigationState();

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
    const inAuthGroup = segments[0] === "(drawer)";
    const isPublicRoute =
      segments[0] === "login" ||
      segments[0] === "create-task" ||
      segments.length === 0; // Root path

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
            name="+not-found"
            options={{ title: "Oops!", headerShown: true }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
