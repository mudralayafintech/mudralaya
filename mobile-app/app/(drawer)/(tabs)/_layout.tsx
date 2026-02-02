import { Tabs } from "expo-router";
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
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
        animation: "none", // Explicitly disable to prevent blinking
        headerTitleStyle: { color: theme === "dark" ? "#fff" : "#000" },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ marginLeft: 20 }}
          >
            <Menu size={24} color={theme === "dark" ? "#fff" : "#000"} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <ListChecks size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
