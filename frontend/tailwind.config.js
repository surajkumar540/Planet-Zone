/**
 * Tailwind is configured as a thin binding over the CSS custom properties in
 * `src/styles/tokens.css`. Utilities therefore resolve to role tokens, so a
 * class like `bg-surface` is correct in both themes without a `dark:` variant.
 *
 * Preflight is on. It was previously disabled so Material UI could keep the
 * browser defaults it relies on, but with MUI gone that setting was actively
 * harmful: without Preflight the default `border-style` is `none`, so every
 * `border` utility set a width against no style and drew nothing. Anchors kept
 * their underline and buttons their platform chrome for the same reason.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // Themes are driven by a `data-theme` stamp rather than a class.
  darkMode: ["selector", '[data-theme="dark"]'],

  theme: {
    extend: {
      colors: {
        surface: {
          canvas: "var(--surface-canvas)",
          DEFAULT: "var(--surface-default)",
          raised: "var(--surface-raised)",
          sunken: "var(--surface-sunken)",
          overlay: "var(--surface-overlay)",
          hover: "var(--surface-hover)",
          active: "var(--surface-active)",
          chart: "var(--surface-chart)",
          inverse: "var(--surface-inverse)",
        },
        content: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          disabled: "var(--text-disabled)",
          inverse: "var(--text-inverse)",
        },
        line: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
        },
        accent: {
          DEFAULT: "var(--accent-solid)",
          hover: "var(--accent-hover)",
          subtle: "var(--accent-subtle)",
          "subtle-hover": "var(--accent-subtle-hover)",
          text: "var(--accent-text)",
          ring: "var(--accent-ring)",
          on: "var(--accent-on-solid)",
        },
        status: {
          good: "var(--status-good)",
          "good-bg": "var(--status-good-bg)",
          warning: "var(--status-warning)",
          "warning-bg": "var(--status-warning-bg)",
          serious: "var(--status-serious)",
          "serious-bg": "var(--status-serious-bg)",
          critical: "var(--status-critical)",
          "critical-bg": "var(--status-critical-bg)",
          info: "var(--status-info)",
          "info-bg": "var(--status-info-bg)",
        },
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        display: ["var(--text-display)", { lineHeight: "var(--text-display-lh)" }],
        page: ["var(--text-page)", { lineHeight: "var(--text-page-lh)" }],
        section: ["var(--text-section)", { lineHeight: "var(--text-section-lh)" }],
        card: ["var(--text-card)", { lineHeight: "var(--text-card-lh)" }],
        body: ["var(--text-body)", { lineHeight: "var(--text-body-lh)" }],
        label: ["var(--text-label)", { lineHeight: "var(--text-label-lh)" }],
        caption: ["var(--text-caption)", { lineHeight: "var(--text-caption-lh)" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      spacing: {
        control: "var(--control-height)",
        "control-sm": "var(--control-height-sm)",
        "control-lg": "var(--control-height-lg)",
        section: "var(--section-gap)",
        sidebar: "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-width-collapsed)",
        topbar: "var(--topbar-height)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out",
        "slide-up": "slide-up 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
