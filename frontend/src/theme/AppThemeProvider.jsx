import { useMemo } from "react";
import { App as AntApp, ConfigProvider, theme as antdTheme } from "antd";

import { ThemeProvider, useTheme } from "./ThemeProvider";
import { buildAntdTheme } from "./antdTheme";
import { getPreset } from "./presets";

/**
 * Feeds the resolved appearance into Ant Design.
 *
 * The dark algorithm is applied first so antd derives its own state colours
 * from a dark seed, then the explicit tokens overwrite the ones this app has
 * an opinion about. Doing it the other way round leaves antd computing hover
 * and disabled steps from a light seed against dark surfaces.
 */
const AntdBridge = ({ children }) => {
  const { resolvedMode, appearance } = useTheme();

  const config = useMemo(
    () =>
      buildAntdTheme({
        mode: resolvedMode,
        accent: getPreset(appearance.accentColor)[resolvedMode],
      }),
    [resolvedMode, appearance.accentColor]
  );

  return (
    <ConfigProvider
      theme={{
        ...config,
        algorithm: resolvedMode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
      // Ripples read as noise next to the app's own transitions.
      wave={{ disabled: true }}
    >
      {/* `App` supplies the context that antd's message/notification/modal
          hooks need; without it they fall back to a static instance that is
          detached from this theme. */}
      <AntApp component={false}>{children}</AntApp>
    </ConfigProvider>
  );
};

/** Single entry point: owns appearance state and wires it into both systems. */
const AppThemeProvider = ({ children }) => (
  <ThemeProvider>
    <AntdBridge>{children}</AntdBridge>
  </ThemeProvider>
);

export default AppThemeProvider;
