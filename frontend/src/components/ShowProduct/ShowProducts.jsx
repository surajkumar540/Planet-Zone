import React,{useState,useEffect} from 'react';
import Header from '../Header/Header';
import ShowProduct from './ShowProduct';
import Products from '../Products/Products';
import Footer from '../Footer/Footer';
import { useSelector } from 'react-redux';

const ShowProducts = () => {
  const {data:products}=useSelector((state)=>state?.products)

  return (
    <>
    <Header/>
    <ShowProduct/>
    <Products products={products}/>
    <Footer/>
    </>
  )
}

export default ShowProducts