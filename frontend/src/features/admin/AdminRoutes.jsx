import { Suspense, lazy } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, ShoppingBag, Store } from "lucide-react";
import LostPage from "../../components/ui/LostPage";
import Button from "../../components/ui/Button";
import { useSelector } from "react-redux";
import { getAnalyticsSummary } from "../../api/adminApi";
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
const Reports = lazy(() => import("./pages/Reports"));
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

/** Unknown path inside the dashboard: stays in the dashboard, says so plainly. */
const AdminNotFound = () => (
  <Card>
    <LostPage
      compact
      title="No such dashboard page"
      description="The link may be old, or the page was moved. Everything is reachable from the menu on the left."
      actions={
        <>
          <Button as={Link} to="/admin" variant="primary" icon={LayoutDashboard}>
            Go to dashboard
          </Button>
          <Button as={Link} to="/admin/orders" variant="secondary" icon={ShoppingBag}>
            Orders
          </Button>
        </>
      }
    />
  </Card>
);

/** A signed-in customer who followed a dashboard link. */
const NoAccess = () => (
  <div className="min-h-screen bg-surface-canvas">
    <LostPage
      code="403"
      title="This area is for the store team"
      description="You're signed in with a customer account, which can't open the dashboard. If you work here, ask an admin to give your account access."
      actions={
        <>
          <Button as={Link} to="/" variant="primary" icon={Store}>
            Back to the shop
          </Button>
          <Button as={Link} to="/orders" variant="secondary" icon={ArrowLeft}>
            Your orders
          </Button>
        </>
      }
    />
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
  const { isAdminLogged, isUserLogged, status } = useSelector((state) => state.user);
  const location = useLocation();

  // The low-stock count feeds the header badge across every dashboard screen.
  // The light summary endpoint is enough; the overview page loads the full dashboard itself.
  const { data: summary } = useApi(getAnalyticsSummary, null, {
    enabled: isAdminLogged,
    cacheTime: 60 * 1000,
  });

  if (status === "idle" || status === "loading") return <RouteFallback />;
  if (!isAdminLogged) {
    // Signed out: sign in, then come straight back here.
    if (!isUserLogged) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    return <NoAccess />;
  }

  return (
    <Routes>
      <Route
        element={<AdminLayout lowStockCount={summary?.lowStock?.value || 0} />}
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
        <Route
          path="reports"
          element={
            <Suspense fallback={<RouteFallback />}>
              <Reports />
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

        <Route path="*" element={<AdminNotFound />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
