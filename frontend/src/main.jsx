import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App.jsx";
import store from "./redux/store/store.js";
import AppThemeProvider from "./theme/AppThemeProvider.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import ErrorBoundary from "./components/ui/ErrorBoundary.jsx";
import "./index.css";

/*
 * Provider order matters: the theme must wrap everything that renders, and the
 * error boundary sits inside it so a crash screen is still themed correctly.
 * Route protection now lives in the router rather than wrapping the tree, so a
 * redirect cannot fire before the destination route is known.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </BrowserRouter>
        </ToastProvider>
      </AppThemeProvider>
    </Provider>
  </React.StrictMode>
);
