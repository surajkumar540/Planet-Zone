import { Box,Button, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const AddProductButton = () => {
  const navigate=useNavigate()
  return (
    <Box marginX={'2rem'} marginY={'1rem'} display={'flex'} justifyContent={'space-between'}>
        <Typography fontSize={'30px'}>All Products</Typography>
        <Button variant='contained' sx={{textTransform:'capitalize'}} onClick={()=>navigate("/addProduct")}>Add Product</Button>
    </Box>
  )
}

export default AddProductButton