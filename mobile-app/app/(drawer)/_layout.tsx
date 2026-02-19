import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "@/components/CustomDrawerContent";
import { useWindowDimensions } from "react-native";
import React from "react";

const DrawerLayout = () => {
  const dimensions = useWindowDimensions();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: dimensions.width >= 768 ? "permanent" : "front",
        drawerStyle: {
          backgroundColor: "transparent",
          width: 280,
        },
        overlayColor: "rgba(0,0,0,0.3)",
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
      <Drawer.Screen name="plans" options={{ headerShown: false }} />
      <Drawer.Screen name="membership" options={{ headerShown: false }} />
      <Drawer.Screen name="settings" options={{ headerShown: false }} />
    </Drawer>
  );
};

export default DrawerLayout;
