import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDashboard } from "../../api/adminApi";
import { useApi } from "../../hooks/useApi";
import AdminLayout from "./components/AdminLayout";
import { SkeletonStat } from "../../components/ui/Skeleton";
import { Card } from "../../components/ui/Card";

/*
 * Every dashboard screen is lazily loaded, so a customer browsing the
 * storefront never downloads the admin bundle or its charting library.
 */
const Overview = lazy(() => import("./pages/Overview"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Products = lazy(() => import("./pages/Products"));
const Categories = lazy(() => import("./pages/Categories"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Customers = lazy(() => import("./pages/Customers"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Messages = lazy(() => import("./pages/Messages"));
const Coupons = lazy(() => import("./pages/Coupons"));
const Refunds = lazy(() => import("./pages/Refunds"));
const Settings = lazy(() => import("./pages/Settings"));

/** Placeholder matching the shape of a typical screen while its chunk loads. */
const RouteFallback = () => (
  <div className="space-y-section">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((index) => (
        <Card key={index}>
          <SkeletonStat />
        </Card>
      ))}
    </div>
  </div>
);

/**
 * Dashboard routes.
 *
 * Access is gated here rather than in a wrapper around the whole app, so an
 * unauthorised visitor is redirected on the route they asked for instead of
 * being bounced before the destination is known. The API enforces the same
 * boundary — this only decides what to render.
 */
const AdminRoutes = () => {
  const { isAdminLogged, status } = useSelector((state) => state.user);

  // The low-stock count feeds the header badge across every dashboard screen.
  const { data: dashboard } = useApi(getDashboard, null, { enabled: isAdminLogged });

  if (status === "idle" || status === "loading") return <RouteFallback />;
  if (!isAdminLogged) return <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route
        element={<AdminLayout lowStockCount={dashboard?.summary?.lowStock?.value || 0} />}
      >
        <Route
          index
          element={
            <Suspense fallback={<RouteFallback />}>
              <Overview />
            </Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Analytics />
            </Suspense>
          }
        />
        <Route
          path="orders"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Orders />
            </Suspense>
          }
        />
        <Route
          path="orders/:id"
          element={
            <Suspense fallback={<RouteFallback />}>
              <OrderDetail />
            </Suspense>
          }
        />
        <Route
          path="products"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Products />
            </Suspense>
          }
        />
        <Route
          path="categories"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Categories />
            </Suspense>
          }
        />
        <Route
          path="inventory"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Inventory />
            </Suspense>
          }
        />
        <Route
          path="customers"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Customers />
            </Suspense>
          }
        />
        <Route
          path="reviews"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Reviews />
            </Suspense>
          }
        />
        <Route
          path="messages"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Messages />
            </Suspense>
          }
        />
        <Route
          path="coupons"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Coupons />
            </Suspense>
          }
        />
        <Route
          path="refunds"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Refunds />
            </Suspense>
          }
        />
        {/* Reports reuse the analytics screen until they diverge. */}
        <Route
          path="reports"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Analytics />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Settings />
            </Suspense>
          }
        />

        {/* Unknown dashboard paths return to the overview rather than the storefront. */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
