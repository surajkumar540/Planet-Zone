import { createTheme } from "@mui/material/styles";

/**
 * Bridges Material UI onto the same design tokens as the Tailwind layer.
 *
 * The existing storefront is built with MUI; rather than migrate it, its theme
 * reads the identical CSS custom properties, so both halves of the app respond
 * to a theme or accent change together.
 *
 * Palette entries must be concrete colours (MUI computes contrast text and
 * hover shades from them), so the accent is passed in resolved. Everything
 * that MUI only forwards to CSS uses the `var()` token directly.
 */
const cssVar = (name) => `var(${name})`;

export const buildMuiTheme = ({ mode, accent }) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: accent.solid,
        dark: accent.hover,
        light: accent.subtle,
        contrastText: accent.onSolid,
      },
      background: {
        default: mode === "dark" ? "#0f1114" : "#f6f7f9",
        paper: mode === "dark" ? "#16191d" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#f3f4f6" : "#111827",
        secondary: mode === "dark" ? "#b6bcc6" : "#4b5563",
        disabled: mode === "dark" ? "#626973" : "#9ca3af",
      },
      divider: mode === "dark" ? "#2e333a" : "#e0e3e8",
      success: { main: mode === "dark" ? "#22c55e" : "#0ca30c" },
      warning: { main: mode === "dark" ? "#fab219" : "#b45309" },
      error: { main: mode === "dark" ? "#ef5b5b" : "#d03b3b" },
      info: { main: mode === "dark" ? "#3987e5" : "#2a78d6" },
    },

    shape: { borderRadius: 8 },

    typography: {
      fontFamily: cssVar("--font-sans"),
      h1: { fontSize: cssVar("--text-display"), fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontSize: cssVar("--text-page"), fontWeight: 600, letterSpacing: "-0.015em" },
      h3: { fontSize: cssVar("--text-section"), fontWeight: 600 },
      h4: { fontSize: cssVar("--text-card"), fontWeight: 600 },
      body1: { fontSize: cssVar("--text-body"), lineHeight: cssVar("--text-body-lh") },
      body2: { fontSize: cssVar("--text-label"), lineHeight: cssVar("--text-label-lh") },
      caption: { fontSize: cssVar("--text-caption") },
      button: { textTransform: "none", fontWeight: 500 },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: cssVar("--surface-canvas"),
            color: cssVar("--text-primary"),
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: "none", borderRadius: cssVar("--radius-md") },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: cssVar("--surface-default"),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: cssVar("--surface-raised"),
            border: `1px solid ${cssVar("--border-subtle")}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { backgroundColor: cssVar("--surface-default") },
          notchedOutline: { borderColor: cssVar("--border-default") },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: cssVar("--border-subtle") },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: cssVar("--surface-inverse"),
            color: cssVar("--text-inverse"),
            fontSize: cssVar("--text-caption"),
          },
        },
      },
    },
  });
