import { Routes, Route } from "react-router-dom"

import Cart from '../../pages/Cart'
import ContactUs from '../../pages/ContactUs'
import AboutUs from '../../pages/AboutUs'
import PaymentMethod from '../../pages/PaymentMethod'
import Profile from '../../pages/Profile'
import ShippingPage from '../../pages/ShippingPage'
import OrderDetailes from '../../pages/OrderDetailes'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'

const OtherRoutes = () => {
  return (
    <>
       <Routes>
        <Route path="/cart" element={ <Cart/> } /> 
        <Route path="/payment" element={ <PaymentMethod/> } /> 
        <Route path="/about" element={ <AboutUs/> } /> 
        <Route path="/profile" element={ <Profile/> } /> 
        <Route path="/contact" element={ <ContactUs/> } /> 
        <Route path="/shipping" element={ <ShippingPage/> } />
        <Route path="/order" element={ <OrderDetailes/> } />
      </Routes>
      <Footer/>
    </>
  )
}

export default OtherRoutes