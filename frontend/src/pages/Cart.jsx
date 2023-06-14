import React from 'react';
import Header from "../components/Header/Header";
import Footer from '../components/Footer/Footer';
import CartPage from '../components/Cart/CartPage';
import products from "../components/Dummy/products"
import {useSelector} from "react-redux"

const Cart = () => {

  const {data:products,status}=useSelector((state)=>state?.cart)

  if(status==='loading')
  {
    return <Typography>Loading</Typography>
  }

  return (
    <>
      <Header/>
      <CartPage products={products}/>
      <Footer/>
    </>
  )
}

export default Cart