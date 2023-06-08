import React from 'react';
import Header from "../components/Header/Header";
// import Footer from '../components/Footer/Footer';
import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import CartProducts from '../components/Cart/CartProducts';
import products from "../components/Dummy/products"

const Cart = () => {

  // const {data:products,status,message}=useSelector((state)=>state?.products)

  // if(status==='loading')
  // {
  //   return <Typography>Loading</Typography>
  // }

  return (
    <>
      <Header/>
      <CartProducts products={products}/>
      {/* <Footer/> */}
    </>
  )
}

export default Cart