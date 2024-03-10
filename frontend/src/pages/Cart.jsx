import React from 'react';
import CartPage from '../components/Cart/CartPage';
import { useSelector } from "react-redux"
import Loader from "../components/Tools/Loader"
import Banner from "../components/Tools/Banner"
import Footer from '../components/Footer/Footer';

const Cart = () => {

  const { data: products, status } = useSelector((state) => state?.cart)

  if (status === 'loading') {
    <Loader />
  }

  return (
    <>
      <Banner />
      <CartPage products={products} />
      <Footer />
    </>
  )
}

export default Cart