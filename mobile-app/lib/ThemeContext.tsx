import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: "light" | "dark"; // Actual active theme
  mode: ThemeMode; // User preference
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  mode: "system",
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem("themeMode").then((storedMode) => {
      if (storedMode) setMode(storedMode as ThemeMode);
    });
  }, []);

  const updateMode = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem("themeMode", newMode);
  };

  const theme = mode === "system" ? systemScheme || "light" : mode;

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode: updateMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
