import { useMemo } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import { buildMuiTheme } from "./muiTheme";
import { getPreset } from "./presets";

/**
 * Feeds the resolved appearance into Material UI so the storefront and the
 * dashboard share one theme.
 */
const MuiBridge = ({ children }) => {
  const { resolvedMode, appearance } = useTheme();

  const theme = useMemo(
    () =>
      buildMuiTheme({
        mode: resolvedMode,
        accent: getPreset(appearance.accentColor)[resolvedMode],
      }),
    [resolvedMode, appearance.accentColor]
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

/** Single entry point: owns appearance state and wires it into both systems. */
const AppThemeProvider = ({ children }) => (
  <ThemeProvider>
    <MuiBridge>{children}</MuiBridge>
  </ThemeProvider>
);

export default AppThemeProvider;
