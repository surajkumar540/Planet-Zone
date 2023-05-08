import React, { useEffect } from 'react';
import Header from "../components/Header/Header";
import Poster1 from '../components/Poster/Poster1';
import Products from "../components/Products/Products"
import axios from 'axios';
import { getAllProducts } from '../api/devApi';

const Home = () => {
  const fetchAllProducts=async()=>{
    try{
      const response=await getAllProducts();
      console.log(response)
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
      <Poster1/>
      <Products/>
    </>
  )
}

export default Home