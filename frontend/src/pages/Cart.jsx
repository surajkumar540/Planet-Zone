import React from 'react';
import Header from "../components/Header/Header";
import Footer from '../components/Footer/Footer';
import CartPage from '../components/Cart/CartPage';
import { Typography } from '@mui/material';
// import products from "../components/Dummy/products"
import {useSelector} from "react-redux"
import Loader from "../components/Tools/Loader"

const Cart = () => {

  const {data:products,status}=useSelector((state)=>state?.cart)

  if(status==='loading')
  {
    <Loader/>
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