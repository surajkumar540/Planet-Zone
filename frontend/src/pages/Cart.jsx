import React from 'react';
import CartPage from '../components/Cart/CartPage';
import {useSelector} from "react-redux"
import Loader from "../components/Tools/Loader"
import Banner from "../components/Tools/Banner"

const Cart = () => {

  const {data:products,status}=useSelector((state)=>state?.cart)

  if(status==='loading')
  {
    <Loader/>
  }

  return (
    <>
      <Banner/>
      <CartPage products={products}/>
    </>
  )
}

export default Cart