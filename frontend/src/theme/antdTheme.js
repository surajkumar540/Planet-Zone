/**
 * Ant Design theme, derived from the same design tokens Tailwind reads.
 *
 * Both systems have to agree or the app looks assembled from two kits: antd
 * components are configured from the resolved palette here, so a Table, a
 * Modal or a DatePicker lands on the same surfaces, radii and type as anything
 * built with utilities.
 *
 * The values are the literal token values rather than `var(--…)` strings.
 * antd's algorithm derives dozens of states (hover, active, disabled, borders)
 * by manipulating the colours it is given, which it cannot do with a CSS
 * variable it never resolves.
 */

/** The token values per mode, mirroring `styles/tokens.css`. */
const PALETTE = {
  light: {
    canvas: "#f6f7f9",
    surface: "#ffffff",
    sunken: "#f1f3f5",
    elevated: "#ffffff",
    hover: "#f3f4f6",
    textPrimary: "#111827",
    textSecondary: "#4b5563",
    textMuted: "#6b7280",
    textDisabled: "#9ca3af",
    borderSubtle: "#eceef1",
    border: "#e0e3e8",
    borderStrong: "#cbd0d8",
    good: "#0ca30c",
    warning: "#b45309",
    critical: "#d03b3b",
    info: "#2a78d6",
    shadow:
      "0 12px 16px -4px rgb(16 24 40 / 0.08), 0 4px 6px -2px rgb(16 24 40 / 0.03)",
  },
  dark: {
    canvas: "#0f1114",
    surface: "#16191d",
    sunken: "#101317",
    elevated: "#1c2025",
    hover: "#22262c",
    textPrimary: "#f3f4f6",
    textSecondary: "#b6bcc6",
    textMuted: "#8b929c",
    textDisabled: "#626973",
    borderSubtle: "#23272d",
    border: "#2e333a",
    borderStrong: "#414851",
    good: "#22c55e",
    warning: "#fab219",
    critical: "#ef5b5b",
    info: "#3987e5",
    shadow: "0 12px 16px -4px rgb(0 0 0 / 0.5), 0 4px 6px -2px rgb(0 0 0 / 0.3)",
  },
};

const FONT_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/**
 * Builds the `theme` object for `ConfigProvider`.
 *
 * @param {{ mode: "light"|"dark", accent: { solid: string, hover: string, text: string, subtle: string } }} options
 */
export const buildAntdTheme = ({ mode, accent }) => {
  const palette = PALETTE[mode] || PALETTE.light;

  return {
    token: {
      /* ---- Brand ---- */
      colorPrimary: accent.solid,
      colorLink: accent.text,
      colorLinkHover: accent.hover,

      /* ---- Status, shared with the badges and toasts ---- */
      colorSuccess: palette.good,
      colorWarning: palette.warning,
      colorError: palette.critical,
      colorInfo: palette.info,

      /* ---- Surfaces ---- */
      colorBgBase: palette.surface,
      colorBgContainer: palette.surface,
      colorBgElevated: palette.elevated,
      colorBgLayout: palette.canvas,
      colorBgSpotlight: palette.elevated,
      colorFillAlter: palette.sunken,
      colorFillSecondary: palette.hover,

      /* ---- Ink ---- */
      colorTextBase: palette.textPrimary,
      colorText: palette.textPrimary,
      colorTextSecondary: palette.textSecondary,
      colorTextTertiary: palette.textMuted,
      colorTextQuaternary: palette.textDisabled,
      colorTextPlaceholder: palette.textDisabled,

      /* ---- Lines ---- */
      colorBorder: palette.borderStrong,
      colorBorderSecondary: palette.borderSubtle,

      /* ---- Type. The scale matches `--text-*`, so a Table cell and a card
             body are the same size. ---- */
      fontFamily: FONT_STACK,
      fontSize: 14,
      fontSizeSM: 13,
      fontSizeLG: 15,
      fontSizeHeading1: 32,
      fontSizeHeading2: 24,
      fontSizeHeading3: 18,
      fontSizeHeading4: 16,
      fontSizeHeading5: 15,
      lineHeight: 1.5714,

      /* ---- Shape ---- */
      borderRadius: 8,
      borderRadiusSM: 6,
      borderRadiusLG: 12,
      borderRadiusXS: 4,
      controlHeight: 36,
      controlHeightSM: 28,
      controlHeightLG: 44,

      /* ---- Elevation ---- */
      boxShadow: palette.shadow,
      boxShadowSecondary: palette.shadow,

      /* ---- Motion. Slightly longer than antd's default with an ease-out
             curve, to match the transitions the Tailwind side uses. ---- */
      motionDurationFast: "0.12s",
      motionDurationMid: "0.2s",
      motionDurationSlow: "0.3s",
      motionEaseInOut: "cubic-bezier(0.16, 1, 0.3, 1)",

      wireframe: false,
    },

    components: {
      Button: {
        primaryShadow: "none",
        defaultShadow: "none",
        dangerShadow: "none",
        fontWeight: 500,
      },
      Input: {
        // The border-led focus state the rest of the app uses: no outer ring.
        activeShadow: "none",
        colorBgContainer: palette.sunken,
        activeBorderColor: accent.solid,
        hoverBorderColor: palette.textMuted,
      },
      InputNumber: {
        activeShadow: "none",
        colorBgContainer: palette.sunken,
      },
      Select: {
        colorBgContainer: palette.sunken,
        optionSelectedBg: accent.subtle,
        optionSelectedColor: accent.text,
        optionActiveBg: palette.hover,
      },
      DatePicker: {
        activeShadow: "none",
        colorBgContainer: palette.sunken,
      },
      Table: {
        headerBg: palette.sunken,
        headerColor: palette.textSecondary,
        headerSplitColor: "transparent",
        borderColor: palette.borderSubtle,
        rowHoverBg: palette.hover,
        cellPaddingBlock: 12,
      },
      Modal: {
        contentBg: palette.elevated,
        headerBg: palette.elevated,
        titleFontSize: 18,
      },
      Drawer: { colorBgElevated: palette.elevated },
      Tooltip: { colorBgSpotlight: palette.textPrimary, colorTextLightSolid: palette.surface },
      Tabs: { itemSelectedColor: accent.text, inkBarColor: accent.solid, horizontalMargin: "0 0 16px 0" },
      Segmented: { itemSelectedBg: palette.surface, trackBg: palette.sunken },
      Pagination: { itemActiveBg: accent.solid },
      Message: { contentBg: palette.elevated },
      Notification: { colorBgElevated: palette.elevated },
      Card: { colorBgContainer: palette.surface, headerBg: "transparent" },
      Steps: { colorPrimary: accent.solid },
      Progress: { defaultColor: accent.solid },
      Empty: { colorTextDescription: palette.textMuted },
    },
  };
};

export default buildAntdTheme;
