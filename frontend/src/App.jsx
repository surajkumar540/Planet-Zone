import "./App.css";
import { useEffect} from "react";
import { Routes, Route } from "react-router-dom";
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
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "./redux/reducers/productSlice";
import ShippingPage from "./pages/ShippingPage";
import OrderDetails from "./pages/OrderDetails";
import Header from "./components/Header/Header";
import AdminHome from "./components/Admin/AdminHome";
import AddProduct from "./components/Admin/AddProduct";
import AdminHeader from "./components/Header/AdminHeader";
import Error from "./components/Tools/Error";
import Orders from "./pages/Orders";
import Shop from "./pages/Shop";
import ContactEmail from "./pages/ContactEmail";
  import EditProduct from "./components/Admin/EditProduct";

function App() {
  const isAdminLogged = useSelector((state) => state?.user?.isAdminLogged);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, []);


  return (
    <>
      {isAdminLogged ? <AdminHeader /> : <Header />}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OtpVerify />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/order/:orderId" element={<OrderDetails />} />

        <Route path="/dashboard" element={<AdminHome />} />
        <Route path="/addProduct" element={<AddProduct />} />
        <Route path="/editProduct/:pid" element={<EditProduct />} />
        <Route path="/mails" element={<ContactEmail />} />
        <Route path="*" element={<Error />} />
    
        <Route path="/shipping" element={<ShippingPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:pid" element={<ShowProducts />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<PaymentMethod />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
    </>
  );
}

export default App;
