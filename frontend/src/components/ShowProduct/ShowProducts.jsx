import React,{useEffect, useState} from 'react';
import Header from '../Header/Header';
import ShowProduct from './ShowProduct';
import Products from '../Products/Products';
import Footer from '../Footer/Footer';
import { useSelector } from 'react-redux';
import { fetchSingleProductApi } from '../../api/devApi';
import { useParams } from 'react-router-dom';

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
  },[pid])

  return (
    <>
    <Header/>
    {/* send single products state/props in show product comp */}
    <ShowProduct obj={singleProduct}/> 
    <Products products={products}/>
    <Footer/>
    </>
  )
}

export default ShowProducts