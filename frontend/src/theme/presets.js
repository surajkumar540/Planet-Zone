/**
 * Accent presets.
 *
 * Each preset supplies explicit light and dark steps rather than deriving them
 * at runtime: a single hue lightened algorithmically does not hold its contrast
 * across both surfaces, so the steps are chosen per mode.
 *
 * `solid` is the button/fill colour, `hover` its pressed state, `subtle` a tinted
 * background for chips and active nav, `text` the accent used for type and icons
 * (stepped to stay legible on the page surface), and `onSolid` the ink on `solid`.
 */
export const ACCENT_PRESETS = [
  {
    id: "emerald",
    name: "Emerald",
    swatch: "#16a34a",
    light: {
      solid: "#16a34a",
      hover: "#15803d",
      subtle: "#dcfce7",
      subtleHover: "#bbf7d0",
      text: "#15803d",
      ring: "#4ade80",
      onSolid: "#ffffff",
    },
    dark: {
      solid: "#22c55e",
      hover: "#16a34a",
      subtle: "#14351f",
      subtleHover: "#1a4527",
      text: "#4ade80",
      ring: "#22c55e",
      onSolid: "#052e16",
    },
  },
  {
    id: "blue",
    name: "Ocean",
    swatch: "#2563eb",
    light: {
      solid: "#2563eb",
      hover: "#1d4ed8",
      subtle: "#dbeafe",
      subtleHover: "#bfdbfe",
      text: "#1d4ed8",
      ring: "#60a5fa",
      onSolid: "#ffffff",
    },
    dark: {
      solid: "#3b82f6",
      hover: "#2563eb",
      subtle: "#16264a",
      subtleHover: "#1e3a68",
      text: "#60a5fa",
      ring: "#3b82f6",
      onSolid: "#0b1c3d",
    },
  },
  {
    id: "violet",
    name: "Violet",
    swatch: "#7c3aed",
    light: {
      solid: "#7c3aed",
      hover: "#6d28d9",
      subtle: "#ede9fe",
      subtleHover: "#ddd6fe",
      text: "#6d28d9",
      ring: "#a78bfa",
      onSolid: "#ffffff",
    },
    dark: {
      solid: "#8b5cf6",
      hover: "#7c3aed",
      subtle: "#2a1e4d",
      subtleHover: "#372764",
      text: "#a78bfa",
      ring: "#8b5cf6",
      onSolid: "#1a1033",
    },
  },
  {
    id: "rose",
    name: "Rose",
    swatch: "#e11d48",
    light: {
      solid: "#e11d48",
      hover: "#be123c",
      subtle: "#ffe4e6",
      subtleHover: "#fecdd3",
      text: "#be123c",
      ring: "#fb7185",
      onSolid: "#ffffff",
    },
    dark: {
      solid: "#f43f5e",
      hover: "#e11d48",
      subtle: "#48151f",
      subtleHover: "#5c1a28",
      text: "#fb7185",
      ring: "#f43f5e",
      onSolid: "#2b0a11",
    },
  },
  {
    id: "amber",
    name: "Amber",
    swatch: "#d97706",
    light: {
      solid: "#d97706",
      hover: "#b45309",
      subtle: "#fef3c7",
      subtleHover: "#fde68a",
      text: "#b45309",
      ring: "#fbbf24",
      onSolid: "#ffffff",
    },
    dark: {
      solid: "#f59e0b",
      hover: "#d97706",
      subtle: "#402a0c",
      subtleHover: "#573813",
      text: "#fbbf24",
      ring: "#f59e0b",
      onSolid: "#271806",
    },
  },
  {
    id: "slate",
    name: "Graphite",
    swatch: "#475569",
    light: {
      solid: "#334155",
      hover: "#1e293b",
      subtle: "#e2e8f0",
      subtleHover: "#cbd5e1",
      text: "#334155",
      ring: "#94a3b8",
      onSolid: "#ffffff",
    },
    dark: {
      solid: "#94a3b8",
      hover: "#cbd5e1",
      subtle: "#26303d",
      subtleHover: "#334155",
      text: "#cbd5e1",
      ring: "#94a3b8",
      onSolid: "#0f172a",
    },
  },
];

export const DEFAULT_ACCENT = "emerald";

export const THEME_MODES = ["light", "dark", "system"];

/** Base font size in px, scaled through the `rem`-based type scale. */
export const FONT_SIZES = {
  sm: 15,
  md: 16,
  lg: 17,
};

/** Multiplier applied to vertical rhythm and control heights. */
export const DENSITIES = {
  compact: 0.875,
  comfortable: 1,
  spacious: 1.125,
};

export const getPreset = (id) =>
  ACCENT_PRESETS.find((preset) => preset.id === id) || ACCENT_PRESETS[0];
