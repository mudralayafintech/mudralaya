import { TopTabs } from "@/layouts/TopTabsLayout";
import {
  Home,
  Wallet,
  User as UserIcon,
  ListChecks,
} from "lucide-react-native";
import { GlassTabBar } from "@/components/GlassTabBar";
import { useTheme } from "@/lib/ThemeContext";
import { TouchableOpacity } from "react-native";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Menu } from "lucide-react-native";

const renderTabBar = (props: any) => <GlassTabBar {...props} />;

export default function TabLayout() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  return (
    <TopTabs
      tabBar={renderTabBar}
      tabBarPosition="bottom"
      initialRouteName="index"
      screenOptions={{
        tabBarIndicatorStyle: { height: 0 }, // Hide default indicator
        swipeEnabled: true, // Enable swipe between tabs
        animationEnabled: true, // Enable sliding animation
        lazy: true, // Optimizes performance

        // Header settings (TopTabs don't have native headers like BottomTabs, so we might need a wrapper or use Stack header)
        // However, expo-router's wrapping might still show the header if it was defined in a parent Stack?
        // Actually, MaterialTopTabs don't support 'headerShown' in screenOptions directly usually.
        // We might need to render a custom header if we want one, or rely on the parent _layout if possible.
        // But the previous implementation had headers.
        // Let's see if we can trick it or if we need to add a custom header component.
        // For now, let's stick to the tab bar migration.
      }}
    >
      <TopTabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }: { color: string }) => (
            <Home size={24} color={color} />
          ),
        }}
      />
      <TopTabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }: { color: string }) => (
            <ListChecks size={24} color={color} />
          ),
        }}
      />
      <TopTabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }: { color: string }) => (
            <Wallet size={24} color={color} />
          ),
        }}
      />
    </TopTabs>
  );
}
