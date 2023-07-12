import React,{useEffect, useState} from 'react';
import ShowProduct from './ShowProduct';
import Products from '../Products/Products';
import { useSelector } from 'react-redux';
import { fetchSingleProductApi } from '../../api/devApi';
import { useParams } from 'react-router-dom';
import Footer from '../Footer/Footer';

const ShowProducts = () => {
  const {pid}=useParams()
  const {data:products}=useSelector((state)=>state?.products);
  const [singleProduct,setSingleProduct]=useState({})

  const fetchSingleProduct=async()=>{
    try{
      const response=await fetchSingleProductApi(pid);
      if(response.status)
      {
        setSingleProduct(response.data);
      }
    }catch(err)
    {
      console.log(err)
    }
  }

  useEffect(()=>{
    fetchSingleProduct()
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Optional: Add smooth scrolling animation
    });
  },[pid])

  return (
    <>
    {/* send single products state/props in show product comp */}
    <ShowProduct obj={singleProduct}/> 
    <Products products={products}/>
    <Footer/>
    </>
  )
}

export default ShowProducts