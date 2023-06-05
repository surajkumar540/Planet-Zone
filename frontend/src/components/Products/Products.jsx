import React from 'react';
import { Box, Typography } from '@mui/material';
import Product from './Product';

const Products = ({products}) => {

  return (
    <Box display={'flex'} justifyContent={'center'} flexDirection={'column'} alignItems={'center'} mb='5rem'>
        <Box textAlign={'center'} my={4}>
            <Typography fontSize={'3rem'}>Featured Products</Typography>
            <Typography>Summer brakes products at your point</Typography>
        </Box>
        <Box display={'flex'}  p={2} gap={12} flexWrap={'wrap'} width={'85%'}>
          {
            products?.map((item)=>{
              return <Product data={item}/>
            })
          }
        
        </Box>
    </Box>
  )
}

export default Products