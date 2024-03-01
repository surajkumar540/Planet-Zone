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
// import Loader from "./components/Tools/Loader";
// import ProtectedRoute from "./components/Provider/ProtectedRoute";
// import { tokenVerificationAsync } from "./redux/reducers/userSlice";
// import { useNavigate } from "react-router-dom";
// import { getToken, getAdmin } from "./utils/functions";

function App() {
  const isAdminLogged = useSelector((state) => state?.user?.isAdminLogged);
  const dispatch = useDispatch();
  // const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  // const checkPath = () => {
  //   let path = location.pathname;
  //   const token = getToken();
  //   const admin = getAdmin();
  //   if (token) {

  //     if (admin && (path === '/' || path === "/cart" || path === "/about" || path === '/profile' || path === '/contact' || path === "/shipping" || path === '/order' || path === '/payment' || path.slice(0, 9) === '/product/')) {
  //       navigate("/dashboard")
  //     }
  //     else if (path === "/login" || path === "/signup") {
  //       navigate("/");
  //     } else {
  //       navigate(path);
  //     }

  //   }
  //   else {
  //     if (path === "/login" || path === "/signup" || path === "/shop" || path === "/about" || path === "/contact" || path === "/cart") {
  //       navigate(path);
  //     } else {
  //       navigate("/");
  //     }
  //   }
  //   setLoading(false)
  // };

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
