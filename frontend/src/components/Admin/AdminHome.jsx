import React, { useEffect, useState } from 'react'
import AdminHeader from '../Header/AdminHeader'
import ProductRow from '../Table/ProductRow'
import ProductHeading from '../Table/ProductHeading'
import AddProductButton from '../Table/AddProductButton'
import { getAllProducts } from '../../api/devApi'
import { Box } from "@mui/material";

const AdminHome = () => {
  const [products,setProducts]=useState([])

  const fetchProducts=async()=>{
    try{
      const response=await getAllProducts();
      setProducts(response.data)
    }catch(error)
    {
      console.log(error)
    }
  }
  
  useEffect(()=>{
    fetchProducts()
  },[])

  return (
    <>  
        <AddProductButton/>
        <ProductHeading/>
        {
          products?.map((item,index)=>{
            return <Box key={index}>
              <ProductRow obj={item} sno={index+1} refetch={fetchProducts}/>
            </Box>
          })
        }
    </>
  )
}

export default AdminHome