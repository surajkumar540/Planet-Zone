import React, { useEffect, useState } from 'react';
import Header from "../components/Header/Header";
import Poster1 from '../components/Poster/Poster1';
import Products from "../components/Products/Products"
import { getAllProducts } from '../api/devApi';
import Poster2 from '../components/Poster/Poster2';
import Poster3 from '../components/Poster/Poster3';
import Footer from '../components/Footer/Footer';

const Home = () => {
  const [products,setProducts]=useState([])

  const fetchAllProducts=async()=>{
    try{
      const response=await getAllProducts();
      setProducts(response.data);
    }catch(error)
    { 
      console.log(error)
    }
  }

  useEffect(()=>{
    fetchAllProducts()
  },[])

  return (
    <>
      <Header/>
      {/* <Poster1/> */}
      {/* <Products products={products}/> */}
      {/* <Poster3/> */}
      {/* <Poster2/> */}
      <Footer/>
    </>
  )
}

export default Home