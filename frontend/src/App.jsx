import { Suspense, lazy, useEffect, useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import StoreRoutes from "./features/store/StoreRoutes";
import FullPageLoader from "./components/ui/FullPageLoader";
import { tokenVerificationAsync } from "./redux/reducers/userSlice";

// The dashboard is a separate bundle; storefront visitors never download it.
const AdminRoutes = lazy(() => import("./features/admin/AdminRoutes"));

/**
 * Application shell.
 *
 * Two products share one bundle entry: the storefront and the dashboard. Each
 * owns its own routes and chrome, so this component only restores the session
 * and decides which of the two is being asked for.
 *
 * Catalogue data is no longer prefetched here — every screen fetches exactly
 * what it renders, which is what stopped the whole shop waiting on one
 * unbounded product request before its first paint.
 */
function App() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { status } = useSelector((state) => state.user);

  const isAdminRoute = pathname.startsWith("/admin");

  // Restore the session once, before anything decides what to render.
  useEffect(() => {
    dispatch(tokenVerificationAsync());
  }, [dispatch]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Hold the first paint until the session is known, so a signed-in
  // administrator does not briefly see the signed-out storefront.
  if (status === "idle" && !isAdminRoute) return <FullPageLoader />;

  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<FullPageLoader />}>
            <AdminRoutes />
          </Suspense>
        }
      />

      {/*
        The previous admin screens lived at these paths. They redirect so old
        links and bookmarks keep working.
      */}
      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/addProduct" element={<Navigate to="/admin/products" replace />} />
      <Route path="/editProduct/:pid" element={<Navigate to="/admin/products" replace />} />
      <Route path="/mails" element={<Navigate to="/admin/messages" replace />} />

      {/* The former two-step checkout is now one screen. */}
      <Route path="/shipping" element={<Navigate to="/checkout" replace />} />
      <Route path="/payment" element={<Navigate to="/checkout" replace />} />

      <Route path="/*" element={<StoreRoutes />} />
    </Routes>
  );
}

export default App;
