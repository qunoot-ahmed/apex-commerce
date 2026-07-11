"use client";

import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CartProvider } from "@/components/providers/CartProvider";

type ColorMode = "light" | "dark";

const ColorModeContext = createContext({
  mode: "light" as ColorMode,
  toggle: () => {},
});

export function useColorMode() {
  return useContext(ColorModeContext);
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("apex-color-mode") as ColorMode | null;
    return stored === "light" || stored === "dark" ? stored : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", mode);
    document.documentElement.classList.toggle("dark-mode", mode === "dark");
    localStorage.setItem("apex-color-mode", mode);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => (m === "light" ? "dark" : "light"));
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: mode === "light" ? "#111827" : "#f3f4f6" },
          secondary: { main: "#2563eb" },
        },
        typography: {
          fontFamily: "var(--font-display), system-ui, sans-serif",
        },
        shape: { borderRadius: 12 },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggle }}>
      <MuiThemeProvider theme={theme}>
        <CartProvider>{children}</CartProvider>
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
}
