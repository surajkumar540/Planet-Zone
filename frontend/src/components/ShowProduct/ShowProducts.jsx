import React,{useState,useEffect} from 'react';
import Header from '../Header/Header';
import ShowProduct from './ShowProduct';
import { getAllProducts } from '../../api/devApi';
import Products from '../Products/Products';
import Footer from '../Footer/Footer';

const ShowProducts = () => {
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
    <ShowProduct/>
    <Products products={products}/>
    <Footer/>
    </>
  )
}

export default ShowProducts