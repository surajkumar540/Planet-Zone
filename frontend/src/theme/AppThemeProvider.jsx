import { ThemeProvider } from "./ThemeProvider";

/**
 * Single entry point for appearance.
 *
 * This used to bridge the resolved theme into Material UI as well. Nothing
 * renders MUI components any more — the legacy storefront was the last caller
 * — so the bridge and its `CssBaseline` are gone, which is also what let
 * Tailwind's Preflight be turned back on.
 */
const AppThemeProvider = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

export default AppThemeProvider;
