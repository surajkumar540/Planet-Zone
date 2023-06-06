import React,{useEffect} from 'react';
import Header from '../Header/Header';
import ShowProduct from './ShowProduct';
import Products from '../Products/Products';
import Footer from '../Footer/Footer';
import { useSelector } from 'react-redux';
import { fetchSingleProductApi } from '../../api/devApi';
import { useParams } from 'react-router-dom';

const ShowProducts = () => {
  const {pid}=useParams()
  const {data:products}=useSelector((state)=>state?.products)

  const fetchSingleProduct=async()=>{
    try{
      const response=await fetchSingleProductApi(pid);
      console.log(response,"single ka response")
    }catch(err)
    {
      console.log(err)
    }
  }

  useEffect(()=>{
    fetchSingleProduct()
  },[])

  return (
    <>
    <Header/>
    {/* send single products state/props in show product comp */}
    <ShowProduct/> 
    <Products products={products}/>
    <Footer/>
    </>
  )
}

export default ShowProducts