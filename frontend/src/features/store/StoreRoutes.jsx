import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import StoreLayout from "./components/StoreLayout";
import RequireAuth from "./components/RequireAuth";
import { Container } from "./components/Primitives";
import { SkeletonText } from "../../components/ui/Skeleton";

/*
 * Landing screens load eagerly because they are what a first visit renders;
 * everything behind a click is split out so the initial bundle stays small.
 */
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";

const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const OtpVerify = lazy(() => import("./pages/auth/OtpVerify"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteFallback = () => (
  <Container className="py-16">
    <SkeletonText lines={8} />
  </Container>
);

/** Wraps a lazily loaded screen in the shared placeholder. */
const load = (Screen) => (
  <Suspense fallback={<RouteFallback />}>
    <Screen />
  </Suspense>
);

/**
 * Storefront routes.
 *
 * Authenticated screens sit under a single `RequireAuth` route rather than
 * each guarding itself, so the rule lives in one place and cannot drift.
 */
const StoreRoutes = () => (
  <Routes>
    {/*
      The auth screens carry their own full-bleed layout. They sit outside
      StoreLayout because the storefront header — search, wishlist, bag — is
      noise on a sign-in page and competes with the one action being asked for.
    */}
    <Route path="login" element={load(Login)} />
    <Route path="signup" element={load(SignUp)} />
    <Route path="otp" element={load(OtpVerify)} />
    <Route path="change-password" element={load(ForgotPassword)} />

    <Route element={<StoreLayout />}>
      <Route index element={<Home />} />
      <Route path="shop" element={<Shop />} />
      <Route path="product/:pid" element={<ProductDetail />} />
      <Route path="cart" element={load(Cart)} />
      <Route path="about" element={load(About)} />
      <Route path="contact" element={load(Contact)} />

      <Route element={<RequireAuth />}>
        <Route path="checkout" element={load(Checkout)} />
        <Route path="orders" element={load(Orders)} />
        <Route path="order/:orderId" element={load(OrderDetail)} />
        <Route path="profile" element={load(Profile)} />
        <Route path="wishlist" element={load(Wishlist)} />
      </Route>

      <Route path="*" element={load(NotFound)} />
    </Route>
  </Routes>
);

export default StoreRoutes;
