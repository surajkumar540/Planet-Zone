import React, { useEffect, useState } from 'react'
import ProductRow from '../Table/ProductRow'
import ProductHeading from '../Table/ProductHeading'
import { getAllProducts } from '../../api/devApi'
import { Box, CardMedia, Typography, Button } from "@mui/material";
import blankHome from "../../assets/Images/admin_empty.webp"
import { useNavigate } from 'react-router-dom'

const AdminHome = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      setProducts(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <>
      <Box marginX={'2rem'} marginY={'1rem'} display={'flex'} justifyContent={'space-between'}>
        <Typography fontSize={'30px'}>All Products</Typography>
        <Button variant='contained' sx={{ textTransform: 'capitalize' }} onClick={() => navigate("/addProduct")}>Add Product</Button>
      </Box>

      {
        products.length === 0 &&
        <Box display={'flex'} justifyContent={'center'} flexDirection={'columnn'} alignContent={'center'}>
          <Box>
            <CardMedia
              sx={{ height: 440, width: 440 }}
              image={blankHome}
              title="green iguana"
            />
            <Typography textAlign={'center'} fontWeight={500} fontSize={'25px'}>No products added</Typography>
          </Box>
        </Box>
      }

      {
        products.length > 0 && <ProductHeading />
      }

      <Box maxHeight={'72vh'} overflow={'auto'}>
        {
          products?.map((item, index) => {
            return <Box key={index}>
              <ProductRow obj={item} sno={index + 1} refetch={fetchProducts} />
            </Box>
          })
        }
      </Box>
    </>
  )
}

export default AdminHome