import React from 'react';
import Header from "../components/Header/Header";
import Footer from '../components/Footer/Footer';
import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';

const Cart = () => {
  const {data:products,status,message}=useSelector((state)=>state?.products)

  if(status==='loading')
  {
    return <Typography>Loading</Typography>
  }

  return (
    <>
      <Header/>
      <Footer/>
    </>
  )
}

export default Cart