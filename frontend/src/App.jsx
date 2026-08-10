import { Suspense, lazy, useEffect, useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import OtpVerify from "./pages/OtpVerify";
import ChangePassword from "./pages/ChangePassword";
import ShowProducts from "./components/ShowProduct/ShowProducts";
import Cart from "./pages/Cart";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import PaymentMethod from "./pages/PaymentMethod";
import Profile from "./pages/Profile";
import ShippingPage from "./pages/ShippingPage";
import OrderDetails from "./pages/OrderDetails";
import Header from "./components/Header/Header";
import Error from "./components/Tools/Error";
import Orders from "./pages/Orders";
import Shop from "./pages/Shop";

import { fetchAllProducts } from "./redux/reducers/productSlice";
import { tokenVerificationAsync } from "./redux/reducers/userSlice";
import Loader from "./components/Tools/Loader";

// The dashboard is a separate bundle; storefront visitors never download it.
const AdminRoutes = lazy(() => import("./features/admin/AdminRoutes"));

/** Storefront chrome, hidden on dashboard routes which have their own shell. */
const StorefrontLayout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);

function App() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { status, isAdminLogged } = useSelector((state) => state.user);

  const isAdminRoute = pathname.startsWith("/admin");

  // Restore the session once, before anything decides what to render.
  useEffect(() => {
    dispatch(tokenVerificationAsync());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Hold the first paint until the session is known, so a signed-in
  // administrator does not briefly see the signed-out storefront.
  if (status === "idle" && !isAdminRoute) return <Loader />;

  return (
    <Routes>
      {/* Dashboard */}
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Loader />}>
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

      {/* Storefront */}
      <Route
        path="*"
        element={
          <StorefrontLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:pid" element={<ShowProducts />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />

              <Route
                path="/login"
                element={isAdminLogged ? <Navigate to="/admin" replace /> : <Login />}
              />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/otp" element={<OtpVerify />} />
              <Route path="/change-password" element={<ChangePassword />} />

              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:orderId" element={<OrderDetails />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/payment" element={<PaymentMethod />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="*" element={<Error />} />
            </Routes>
          </StorefrontLayout>
        }
      />
    </Routes>
  );
}

export default App;
