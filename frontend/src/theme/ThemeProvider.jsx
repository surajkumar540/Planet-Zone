import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_ACCENT, DENSITIES, FONT_SIZES, getPreset } from "./presets";

const STORAGE_KEY = "planet.appearance";

const DEFAULT_APPEARANCE = {
  themeMode: "system",
  accentColor: DEFAULT_ACCENT,
  fontSize: "md",
  density: "comfortable",
  sidebarCollapsed: false,
};

const ThemeContext = createContext(null);

const readStored = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return stored ? { ...DEFAULT_APPEARANCE, ...stored } : DEFAULT_APPEARANCE;
  } catch {
    return DEFAULT_APPEARANCE;
  }
};

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;

/** Resolves "system" against the OS preference. */
const resolveMode = (themeMode) => {
  if (themeMode === "system") return prefersDark() ? "dark" : "light";
  return themeMode;
};

/**
 * Writes the appearance to the document.
 *
 * Everything downstream reads CSS custom properties, so this is the only place
 * that touches the DOM for theming — components never branch on the mode.
 */
const applyAppearance = (appearance) => {
  const root = document.documentElement;
  const mode = resolveMode(appearance.themeMode);

  // "system" leaves the stamp off so the media query in tokens.css applies.
  if (appearance.themeMode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);

  const accent = getPreset(appearance.accentColor)[mode];
  root.style.setProperty("--accent-solid", accent.solid);
  root.style.setProperty("--accent-hover", accent.hover);
  root.style.setProperty("--accent-subtle", accent.subtle);
  root.style.setProperty("--accent-subtle-hover", accent.subtleHover);
  root.style.setProperty("--accent-text", accent.text);
  root.style.setProperty("--accent-ring", accent.ring);
  root.style.setProperty("--accent-on-solid", accent.onSolid);

  // The whole rem-based type scale keys off this one value.
  root.style.fontSize = `${FONT_SIZES[appearance.fontSize] || FONT_SIZES.md}px`;
  root.style.setProperty(
    "--density",
    String(DENSITIES[appearance.density] ?? DENSITIES.comfortable)
  );

  // Lets the browser theme form controls and scrollbars to match.
  root.style.colorScheme = mode;
};

export const ThemeProvider = ({ children }) => {
  const [appearance, setAppearance] = useState(readStored);

  // Applied synchronously on mount so the first paint is already themed.
  useEffect(() => {
    applyAppearance(appearance);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
  }, [appearance]);

  // Follow the OS while the user is on "system".
  useEffect(() => {
    if (appearance.themeMode !== "system") return undefined;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyAppearance(appearance);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [appearance]);

  /**
   * Applies a change with a brief colour transition.
   *
   * The class is removed afterwards so the transition never applies to
   * ordinary hover and focus states, where it would feel sluggish.
   */
  const update = useCallback((patch) => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 220);

    setAppearance((current) => ({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => update(DEFAULT_APPEARANCE), [update]);

  const value = useMemo(() => {
    const resolvedMode = resolveMode(appearance.themeMode);
    return {
      appearance,
      /** "light" or "dark" — never "system". Charts and images key off this. */
      resolvedMode,
      isDark: resolvedMode === "dark",
      setThemeMode: (themeMode) => update({ themeMode }),
      setAccentColor: (accentColor) => update({ accentColor }),
      setFontSize: (fontSize) => update({ fontSize }),
      setDensity: (density) => update({ density }),
      toggleSidebar: () => update({ sidebarCollapsed: !appearance.sidebarCollapsed }),
      setSidebarCollapsed: (sidebarCollapsed) => update({ sidebarCollapsed }),
      update,
      reset,
    };
  }, [appearance, update, reset]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside a ThemeProvider");
  return context;
};

export { DEFAULT_APPEARANCE, STORAGE_KEY };
