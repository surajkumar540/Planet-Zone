import React, { useEffect } from 'react';
import Header from "../components/Header/Header";
import Poster1 from '../components/Poster/Poster1';
import Products from "../components/Products/Products"
// import Poster2 from '../components/Poster/Poster2';
// import Poster3 from '../components/Poster/Poster3';
import Footer from '../components/Footer/Footer';
import { useSelector } from 'react-redux';
import { Typography } from '@mui/material';
import AboutUs from '../pages/AboutUs'
import ContactUs from '../pages/ContactUs'
import Features from './Features';
import Location from "./Loaction";
const Home = () => {
  const {data:products,status,message}=useSelector((state)=>state?.products)

  if(status==='loading')
  {
    return <Typography>Loading</Typography>
  }

  return (
    <>
      <Header/>
      <Poster1/>
      <Products products={products}/>
      <AboutUs/>
      <ContactUs/>
      <Features/>
      <Location/>
      {/* <Poster3/> */}
      {/* <Poster2/> */}
      <Footer/>
    </>
  )
}

export default Home