import React, { useEffect, useState } from 'react'
import AdminHeader from '../Header/AdminHeader'
import ProductRow from '../Table/ProductRow'
import ProductHeading from '../Table/ProductHeading'
import AddProductButton from '../Table/AddProductButton'
import { getAllProducts } from '../../api/devApi'
import { Box, CardMedia, Typography } from "@mui/material";
import blankHome from "../../assets/Images/admin_empty.webp"

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

          {
            products.length===0&&
            <Box display={'flex'} justifyContent={'center'} flexDirection={'columnn'} alignContent={'center'}>
            <Box>
            <CardMedia
            sx={{ height: 440,width:440 }}
            image={blankHome}
            title="green iguana"
            />
            <Typography textAlign={'center'} fontWeight={500} fontSize={'25px'}>No products added</Typography>
          </Box>

          </Box>
          }

        {
          products.length>0&&<ProductHeading/>
        }
        
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