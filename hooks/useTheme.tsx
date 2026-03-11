import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";

export interface ColorScheme {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  gradients: {
    background: [string, string];
    surface: [string, string];
    primary: [string, string];
    success: [string, string];
    warning: [string, string];
    danger: [string, string];
    muted: [string, string];
    empty: [string, string];
  };
  backgrounds: {
    input: string;
    editInput: string;
  };
  statusBarstyle: "light-content" | "dark-content";
}

const lightColors: ColorScheme = {
  bg: "#D2C4A8",
  surface: "#E0D5BF",
  text: "#3E2723",
  textMuted: "#6D4C41",
  border: "#BFB094",
  primary: "#795548",
  success: "#558B2F",
  warning: "#F57F17",
  danger: "#C62828",
  shadow: "#000000",
  gradients: {
    background: ["#D2C4A8", "#C4B496"],
    surface: ["#E0D5BF", "#D2C4A8"],
    primary: ["#795548", "#5D4037"],
    success: ["#558B2F", "#33691E"],
    warning: ["#F57F17", "#E65100"],
    danger: ["#C62828", "#B71C1C"],
    muted: ["#A1887F", "#8D6E63"],
    empty: ["#C4B496", "#BFB094"],
  },
  backgrounds: {
    input: "#E0D5BF",
    editInput: "#E0D5BF",
  },
  statusBarstyle: "dark-content" as const,
};

const darkColors: ColorScheme = {
  bg: "#2C1F14",
  surface: "#3E2F22",
  text: "#F5EDE4",
  textMuted: "#BCAAA4",
  border: "#5D4037",
  primary: "#D7A86E",
  success: "#81C784",
  warning: "#FFD54F",
  danger: "#EF9A9A",
  shadow: "#000000",
  gradients: {
    background: ["#2C1F14", "#3E2F22"],
    surface: ["#3E2F22", "#5D4037"],
    primary: ["#D7A86E", "#8D6E63"],
    success: ["#81C784", "#66BB6A"],
    warning: ["#FFD54F", "#FFC107"],
    danger: ["#EF9A9A", "#E57373"],
    muted: ["#5D4037", "#4E342E"],
    empty: ["#5D4037", "#4E342E"],
  },
  backgrounds: {
    input: "#3E2F22",
    editInput: "#2C1F14",
  },
  statusBarstyle: "light-content" as const,
};

interface ThemeContextValue {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: ColorScheme;
}
type ThemeContexType = ThemeContextValue | undefined;
const ThemeContext = createContext<undefined | ThemeContexType>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // get the user's choice
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value) setIsDarkMode(JSON.parse(value));
    });
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem("darkMode", JSON.stringify(newMode));
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context == undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default useTheme;
